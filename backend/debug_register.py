import asyncio
import traceback
from app.database.connection import async_session
from app.schemas.auth import RegisterRequest
from app.services.auth_service import register_user

async def run():
    user = RegisterRequest(
        full_name='Debug User',
        email='debuguser1@example.com',
        phone='9123456789',
        password='Password123',
        role='citizen',
        ward='Ward 1',
    )
    async with async_session() as session:
        try:
            user_obj = await register_user(session, user)
            print('registered', user_obj.id, user_obj.email)
        except Exception as exc:
            print('EXC', type(exc).__name__, str(exc))
            traceback.print_exc()

if __name__ == '__main__':
    asyncio.run(run())
