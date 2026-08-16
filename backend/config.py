from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./authguard.db"
    JWT_SECRET_KEY: str = "change-me-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 60
    ADMIN_USERNAME: str = "admin"
    ADMIN_PASSWORD_HASH: str = ""
    SAFE_BROWSING_API_KEY: Optional[str] = None
    CORS_ORIGINS: list[str] = ["*"]
    PROTECTED_BRANDS: list[str] = [
        "capitalone.com", "amazon.com", "google.com", "paypal.com",
        "apple.com", "microsoft.com", "netflix.com", "chase.com",
        "wellsfargo.com", "bankofamerica.com", "citibank.com",
        "facebook.com", "instagram.com", "twitter.com", "linkedin.com",
        "dropbox.com", "github.com", "ebay.com", "walmart.com",
    ]
    # Minimum Levenshtein similarity (0-1) to flag as a typo-squat; 0.7 = 70% similar
    LEVENSHTEIN_THRESHOLD: float = 0.7

    model_config = SettingsConfigDict(env_file=".env")


settings = Settings()
