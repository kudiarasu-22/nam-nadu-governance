from dotenv import load_dotenv
load_dotenv()
from app.database.connection import SessionLocal, Base, engine
from app.models.leadership import WardEmergencyAlert

WardEmergencyAlert.__table__.drop(engine, checkfirst=True)
Base.metadata.create_all(bind=engine)
print('WardEmergencyAlert recreated.')
