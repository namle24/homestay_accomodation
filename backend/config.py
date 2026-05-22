from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Lehona Backend"
    environment: str = "development"

    database_url: str = "sqlite:///./homestay.db"
    redis_url: str = "redis://localhost:6379/0"

    # JWT Settings
    secret_key: str = "your-super-secret-key-change-this-in-env"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


@lru_cache
def get_settings() -> Settings:
    return Settings()

