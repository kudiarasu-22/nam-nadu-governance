import requests

BASE_URL = "http://127.0.0.1:8000/api/v1"

def test_mlas():
    print("Logging in CM Admin...")
    res = requests.post(f"{BASE_URL}/cm_admin/login", json={
        "identifier": "cm@namnadu.gov.in",
        "password": "demo123"
    })
    token = res.json()["access_token"]
    
    print("\nFetching MLAs...")
    notif_res = requests.get(f"{BASE_URL}/cm_admin/mlas", headers={
        "Authorization": f"Bearer {token}"
    })
    print("Status:", notif_res.status_code)
    if notif_res.status_code != 200:
        print("Error:", notif_res.text)

if __name__ == "__main__":
    test_mlas()
