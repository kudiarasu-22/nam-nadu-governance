import requests

BASE_URL = "http://127.0.0.1:8000/api/v1"

def test_flows():
    print("=== Testing MLA Login ===")
    res = requests.post(f"{BASE_URL}/leadership/login", json={
        "mla_id": "TN-MLA-CHENNAI-001",
        "password": "demo123"
    })
    
    if res.status_code == 200:
        print("[SUCCESS] MLA Login Success!")
        token = res.json().get("access_token")
        
        print("\n=== Testing MLA Dashboard APIs ===")
        headers = {"Authorization": f"Bearer {token}"}
        
        profile = requests.get(f"{BASE_URL}/leadership/profile", headers=headers)
        print("Profile Status:", profile.status_code)
        
        analytics = requests.get(f"{BASE_URL}/leadership/analytics", headers=headers)
        print("Analytics Status:", analytics.status_code)
        
        complaints = requests.get(f"{BASE_URL}/leadership/complaints", headers=headers)
        print("Complaints Status:", complaints.status_code)
        
        if profile.status_code == 200 and analytics.status_code == 200:
            print("[SUCCESS] MLA Dashboard APIs are accessible.")
        else:
            print("[FAILED] MLA Dashboard APIs failed.")
    else:
        print("[FAILED] MLA Login Failed:", res.status_code, res.text)
        
    print("\n=== Testing CM Admin Login ===")
    res = requests.post(f"{BASE_URL}/cm_admin/login", json={
        "identifier": "cm@namnadu.gov.in",
        "password": "demo123"
    })
    
    if res.status_code == 200:
        print("[SUCCESS] CM Admin Login Success!")
        token = res.json().get("access_token")
        
        print("\n=== Testing CM Admin APIs ===")
        headers = {"Authorization": f"Bearer {token}"}
        
        stats = requests.get(f"{BASE_URL}/cm_admin/dashboard/stats", headers=headers)
        print("CM Stats Status:", stats.status_code)
        
        if stats.status_code == 200:
            print("[SUCCESS] CM Admin Dashboard APIs are accessible.")
        else:
            print("[FAILED] CM Admin Dashboard APIs failed.", stats.text)
    else:
        print("[FAILED] CM Admin Login Failed:", res.status_code, res.text)

if __name__ == "__main__":
    try:
        test_flows()
    except Exception as e:
        print("Error:", e)
