from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    GROQ_API_KEY: str
    APP_NAME: str = "English Buddy"
    DEBUG: bool = True

    class Config:
        env_file = ".env"

settings = Settings()