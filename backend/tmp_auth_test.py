import urllib.request
import urllib.error
import json

payloads = [
    (
        'http://127.0.0.1:8000/api/v1/auth/register',
        {
            'full_name': 'Test User',
            'email': 'testuser1@example.com',
            'phone': '9123456789',
            'password': 'Password123',
            'role': 'citizen',
            'ward': 'Ward 1',
        },
    ),
    (
        'http://127.0.0.1:8000/api/v1/auth/login',
        {'identifier': 'testuser1@example.com', 'password': 'Password123'},
    ),
]

for url, payload in payloads:
    req = urllib.request.Request(url, data=json.dumps(payload).encode('utf-8'), headers={'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(req) as r:
            print(url, r.status)
            print(r.read().decode())
    except urllib.error.HTTPError as e:
        print(url, 'HTTPERR', e.code)
        print(e.read().decode())
    except Exception as e:
        print(url, 'ERR', repr(e))
