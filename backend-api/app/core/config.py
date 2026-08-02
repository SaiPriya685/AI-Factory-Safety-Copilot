from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str
    API_VERSION: str

    HOST: str
    PORT: int

    DEBUG: bool

    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int

    MONGODB_URL: "mongodb+srv://junaidshah7922_db_user:<QgojhNmG9sS0AkQ0>@cluster0.wshkjxe.mongodb.net/?appName=Cluster0"
    DATABASE_NAME: str

    GEMINI_API_KEY: str

    CORS_ORIGINS: str

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore"
    )


settings = Settings()
