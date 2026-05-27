import requests

BASE_URL = "http://127.0.0.1:8000/api/v1"

def test_cm():
    print("Logging in CM Admin...")
    res = requests.post(f"{BASE_URL}/cm_admin/login", json={
        "identifier": "cm@namnadu.gov.in",
        "password": "demo123"
    })
    print("Login Status:", res.status_code)
    if res.status_code != 200:
        print("Login Error:", res.text)
        return
        
    data = res.json()
    token = data["access_token"]
    print("CM Admin Role in response:", data.get("user", {}).get("role"))
    
    print("\nFetching CM Stats...")
    stats_res = requests.get(f"{BASE_URL}/cm_admin/dashboard/stats", headers={
        "Authorization": f"Bearer {token}"
    })
    print("Stats Status:", stats_res.status_code)
    if stats_res.status_code != 200:
        print("Stats Error:", stats_res.text)

if __name__ == "__main__":
    test_cm()
