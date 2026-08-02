from bson import ObjectId

from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
)
from app.database.database import get_database


class AuthService:

    @staticmethod
    async def register(user: dict):

        db = get_database()

        existing = await db.users.find_one({"email": user["email"]})

        if existing:
            raise ValueError("Email already registered")

        user["password"] = hash_password(user["password"])

        result = await db.users.insert_one(user)

        return str(result.inserted_id)

    @staticmethod
    async def login(email: str, password: str):

        db = get_database()

        user = await db.users.find_one({"email": email})

        if not user:
            raise ValueError("Invalid Credentials")

        if not verify_password(password, user["password"]):
            raise ValueError("Invalid Credentials")

        token = create_access_token(
            {
                "sub": str(user["_id"]),
                "role": user["role"],
            }
        )

        return {
            "access_token": token,
            "token_type": "bearer",
        }