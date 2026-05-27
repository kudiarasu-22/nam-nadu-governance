import requests
import re

BASE_URL = "http://127.0.0.1:8000/api/v1"

def test_routes():
    print("Testing /login (Citizen/Officer)")
    # Should fail if we use MLA ID
    res = requests.post(f"{BASE_URL}/auth/login", json={"identifier": "TN-MLA-CHENNAI-001", "password": "password123"})
    print("Auth login with MLA ID status:", res.status_code)
    
    print("\nTesting /leadership/login (MLA)")
    res = requests.post(f"{BASE_URL}/leadership/login", json={"mla_id": "TN-MLA-CHENNAI-001", "password": "password123"})
    print("Leadership login status:", res.status_code)
    
    print("\nTesting /cm_admin/login")
    res = requests.post(f"{BASE_URL}/cm_admin/login", json={"identifier": "citizen@namnadu.gov.in", "password": "password123"})
    print("CM login with citizen status:", res.status_code)
    print("CM login response:", res.json() if res.status_code != 500 else "Server Error")

if __name__ == "__main__":
    try:
        test_routes()
    except Exception as e:
        print("Error:", e)
