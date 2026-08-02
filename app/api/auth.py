from fastapi import APIRouter, HTTPException, status

from app.schemas.user_schema import UserRegister, UserLogin
from app.services.auth_service import AuthService

router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"]
)


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(user: UserRegister):

    try:
        user_id = await AuthService.register(user.model_dump())

        return {
            "success": True,
            "message": "User registered successfully",
            "user_id": user_id
        }

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )


@router.post("/login")
async def login(user: UserLogin):

    try:
        token = await AuthService.login(
            user.email,
            user.password
        )

        return token

    except ValueError as e:
        raise HTTPException(
            status_code=401,
            detail=str(e)
        )