import sys
import os
from fastapi.testclient import TestClient

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from app.main import app

client = TestClient(app)

print("GET /api/v1/master/categories")
res = client.get("/api/v1/master/categories")
print(res.json()[:2])
