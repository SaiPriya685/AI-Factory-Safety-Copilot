from datetime import datetime


def user_document(data: dict) -> dict:
    return {
        "full_name": data["full_name"],
        "email": data["email"],
        "password": data["password"],
        "role": data["role"],
        "created_at": datetime.utcnow(),
    }