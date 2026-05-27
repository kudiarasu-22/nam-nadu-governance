from dotenv import load_dotenv
load_dotenv()
from app.database.connection import SessionLocal, Base, engine
from app.models.leadership import MlaAuth, WardEmergencyAlert

db = SessionLocal()
Base.metadata.create_all(bind=engine)
db.query(MlaAuth).delete()
db.commit()
print('MlaAuth cleared and WardEmergencyAlert created.')
