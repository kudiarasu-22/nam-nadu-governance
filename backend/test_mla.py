import requests

BASE_URL = "http://127.0.0.1:8000/api/v1"

def test_mla():
    print("Logging in MLA...")
    res = requests.post(f"{BASE_URL}/leadership/login", json={
        "mla_id": "TN-MLA-CHENNAI-001",
        "password": "password123" # assuming password123 from seed or earlier registration
    })
    print("Login Status:", res.status_code)
    if res.status_code != 200:
        print("Login Error:", res.text)
        return
        
    data = res.json()
    token = data["access_token"]
    print("MLA ID:", data["mla_id"])
    
    print("\nFetching MLA Profile...")
    prof_res = requests.get(f"{BASE_URL}/leadership/profile", headers={
        "Authorization": f"Bearer {token}"
    })
    print("Profile Status:", prof_res.status_code)
    if prof_res.status_code != 200:
        print("Profile Error:", prof_res.text)

if __name__ == "__main__":
    test_mla()
