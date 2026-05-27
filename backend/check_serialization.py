import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from app.database.connection import SessionLocal
from app.models.user import User
from app.services.auth_service import user_to_response

db = SessionLocal()
cm_user = db.query(User).filter(User.email == "cm@namnadu.gov.in").first()
if cm_user:
    res = user_to_response(cm_user)
    print("user_to_response result:", res)
    print("Type of role:", type(res["role"]), "Value:", res["role"])
else:
    print("CM User not found")
