import urllib.request
import urllib.error
import json
import sys

BASE_URL = "http://127.0.0.1:8000/api/v1"

def print_result(name, passed, detail=""):
    status = "[PASS]" if passed else "[FAIL]"
    print(f"{status} | {name} {f'- {detail}' if detail else ''}")

def make_request(url, method="GET", data=None, headers=None):
    if headers is None:
        headers = {}
    if data is not None:
        data = json.dumps(data).encode('utf-8')
        headers['Content-Type'] = 'application/json'
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as response:
            return response.status, json.loads(response.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode('utf-8')
    except Exception as e:
        return 500, str(e)

def run_tests():
    print("--- STARTING E2E API TESTS ---")
    
    # 1. Test Health
    status, res = make_request(f"{BASE_URL}/health")
    print_result("Health Check", status == 200, str(res))

    # 2. Test MLA Login
    mla_token = None
    status, res = make_request(f"{BASE_URL}/mla/auth/login", method="POST", data={
        "mla_id": "TN-MLA-CHENNAI-001",
        "password": "demo123"
    })
    if status == 200:
        mla_token = res.get("access_token")
        print_result("MLA Login", True, "Token received")
    else:
        print_result("MLA Login", False, f"Status: {status}, {res}")

    # 3. Test Leadership APIs
    if mla_token:
        headers = {"Authorization": f"Bearer {mla_token}"}
        
        status, res = make_request(f"{BASE_URL}/leadership/profile", headers=headers)
        print_result("MLA Profile API", status == 200, str(res)[:100])
        
        status, res = make_request(f"{BASE_URL}/leadership/analytics", headers=headers)
        print_result("MLA Analytics API", status == 200, str(res)[:100])
        
        status, res = make_request(f"{BASE_URL}/leadership/performance", headers=headers)
        print_result("MLA Performance API", status == 200, str(res)[:100])
        
        status, res = make_request(f"{BASE_URL}/leadership/complaints", headers=headers)
        print_result("MLA Complaints API", status == 200, f"Found {len(res) if status==200 else 0} complaints")
        
        status, res = make_request(f"{BASE_URL}/leadership/projects", headers=headers)
        print_result("MLA Projects API", status == 200, f"Found {len(res) if status==200 else 0} projects")
        
        status, res = make_request(f"{BASE_URL}/cm_admin/dashboard/stats", headers=headers)
        print_result("RBAC: MLA blocked from CM API", status in [401, 403], f"Status: {status}")

    # 4. Test CM Admin Login
    cm_token = None
    status, res = make_request(f"{BASE_URL}/auth/login", method="POST", data={
        "identifier": "cm@namnadu.gov.in",
        "password": "demo123"
    })
    if status == 200:
        cm_token = res.get("access_token")
        print_result("CM Admin Login", True, "Token received")
    else:
        print_result("CM Admin Login", False, f"Status: {status}, {res}")

    if cm_token:
        headers = {"Authorization": f"Bearer {cm_token}"}
        
        status, res = make_request(f"{BASE_URL}/cm_admin/dashboard/stats", headers=headers)
        print_result("CM Dashboard Stats API", status == 200, str(res)[:100])
        
        status, res = make_request(f"{BASE_URL}/cm_admin/mlas", headers=headers)
        print_result("CM MLAs List API", status == 200, f"Found {len(res) if status==200 else 0} MLAs")
        
        status, res = make_request(f"{BASE_URL}/leadership/profile", headers=headers)
        print_result("RBAC: CM Admin accessing MLA route", status in [403, 401], f"Status: {status}")

if __name__ == "__main__":
    run_tests()
