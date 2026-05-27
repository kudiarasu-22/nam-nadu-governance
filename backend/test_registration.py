import requests

BASE_URL = 'http://127.0.0.1:8000/api/v1'

print("--- Testing MLA Auth Flow ---")

# 1. Register
print("\n1. Testing Registration...")
reg_data = {
    'name': 'Udhayanidhi Stalin',
    'district': 'Chennai',
    'ward': 'Chepauk-Thiruvallikeni',
    'party': 'DMK',
    'password': 'securepassword'
}
r = requests.post(f"{BASE_URL}/mla/auth/register", json=reg_data)
print("Status:", r.status_code)
print("Response:", r.json())

if r.status_code == 200:
    mla_id = r.json()['mla_id']
    print(f"\n2. Testing Login for {mla_id}...")
    login_data = {'mla_id': mla_id, 'password': 'securepassword'}
    r_login = requests.post(f"{BASE_URL}/mla/auth/login", json=login_data)
    print("Login Status:", r_login.status_code)
    if r_login.status_code == 200:
        token = r_login.json()['access_token']
        print("\n3. Testing MLA Profile Fetch...")
        headers = {'Authorization': f"Bearer {token}"}
        r_prof = requests.get(f"{BASE_URL}/leadership/profile", headers=headers)
        print("Profile Status:", r_prof.status_code)
        print("Profile:", r_prof.json())
        
        print("\n4. Testing MLA Alerts...")
        alert_data = {
            "title": "Flooding in Chepauk",
            "description": "Heavy water stagnation near stadium",
            "severity": "high",
            "area": "Chepauk Stadium"
        }
        r_alert = requests.post(f"{BASE_URL}/leadership/alerts", json=alert_data, headers=headers)
        print("Alert Post Status:", r_alert.status_code)
        print("Alert Post Response:", r_alert.json())
        
        r_get_alerts = requests.get(f"{BASE_URL}/leadership/alerts", headers=headers)
        print("Alert Get Status:", r_get_alerts.status_code)
        print("Alert Get Response:", r_get_alerts.json())
