import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from app.database.connection import SessionLocal
from app.models.user import User, Role
from app.models.leadership import MlaProfile

db = SessionLocal()
cm_user = db.query(User).filter(User.email == "cm@namnadu.gov.in").first()
if cm_user:
    print(f"CM User: {cm_user.full_name}, role: {cm_user.role.name}")
else:
    print("CM User not found")

mla = db.query(MlaProfile).first()
if mla:
    print(f"MLA: {mla.name}, ID: {mla.mla_id}, ward_id: {mla.ward_id}, active: {mla.is_active}")
else:
    print("No MLA profile found")
