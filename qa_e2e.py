import urllib.request
import urllib.parse
import json
import sys

BASE_URL = "http://127.0.0.1:8000/api/v1"

def api_call(method, path, token=None, payload=None):
    url = BASE_URL + path
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
        
    data = None
    if payload:
        if method == "POST" and "token" in path:
            # form encoded for OAuth2
            headers["Content-Type"] = "application/x-www-form-urlencoded"
            data = urllib.parse.urlencode(payload).encode('utf-8')
        else:
            data = json.dumps(payload).encode('utf-8')

    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as response:
            return response.status, json.loads(response.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        body = e.read().decode('utf-8')
        return e.code, json.loads(body) if body else {}

def main():
    print("Running QA TASK 5: E2E Workflow Tests...")
    
    # 1. Test Auth for different roles
    # We seeded users in seed_master_data.py
    # Citizen: ramesh_citizen / pass123
    # Officer: priya_officer / pass123
    # Leadership: arun_admin / pass123
    # Volunteer: karthik_vol / pass123

    users = {
        "citizen": "citizen@namnadu.gov.in",
        "officer": "officer@namnadu.gov.in",
        "leadership": "leadership@namnadu.gov.in",
        "volunteer": "volunteer@namnadu.gov.in"
    }

    tokens = {}

    for role, username in users.items():
        status, data = api_call("POST", "/auth/login", payload={"identifier": username, "password": "demo123"})
        if status != 200:
            print(f"FAIL: Login for {role} failed. Expected 200, got {status}. Data: {data}")
            sys.exit(1)
        tokens[role] = data["access_token"]
        print(f"PASS: Login {role}")

    # Flow 1: Citizen creates complaint
    status, data = api_call("POST", "/complaints/create", token=tokens["citizen"], payload={
        "title": "E2E Test Complaint",
        "description": "This is an E2E test",
        "category_id": 1,
        "district_id": 1,
        "ward_id": 1,
        "area_id": 1,
        "fallback_landmark": "Near bus stand",
        "priority": "low",
        "lat": 13.0,
        "lng": 80.0
    })
    if status != 200:
        print(f"FAIL: Citizen create complaint failed. {status} {data}")
        sys.exit(1)
    complaint_id = data["id"]
    print("PASS: Citizen created complaint")

    # Flow 2: Officer updates complaint
    # Wait, the complaint might not be assigned to priya_officer automatically in my basic test,
    # but the API might allow any officer or we can just fetch to see if it works.
    status, data = api_call("GET", "/officer/complaints", token=tokens["officer"])
    if status != 200:
        print(f"FAIL: Officer fetch complaints failed. {status} {data}")
        sys.exit(1)
    print("PASS: Officer fetched complaints")

    status, data = api_call("PATCH", f"/officer/complaints/{complaint_id}", token=tokens["officer"], payload={
        "status": "in_progress",
        "comment": "Officer reviewing"
    })
    if status != 200:
        print(f"FAIL: Officer update complaint failed. {status} {data}")
        sys.exit(1)
    print("PASS: Officer updated complaint")

    # Flow 3: Leadership fetches analytics
    status, data = api_call("GET", "/leadership/analytics", token=tokens["leadership"])
    if status != 200:
        print(f"FAIL: Leadership analytics failed. {status} {data}")
        sys.exit(1)
    print("PASS: Leadership fetched analytics")

    # Flow 4: Volunteer fetches tasks and profile
    status, data = api_call("GET", "/volunteer/profile", token=tokens["volunteer"])
    if status != 200:
        print(f"FAIL: Volunteer profile failed. {status} {data}")
        sys.exit(1)
    print("PASS: Volunteer fetched profile")

    print("QA TASK 5 COMPLETED SUCCESSFULLY.")

if __name__ == "__main__":
    main()
