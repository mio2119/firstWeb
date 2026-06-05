from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "Smart Enroll Backend"
    api_prefix: str = "/api"
    frontend_origin: str = "http://localhost:3000"


settings = Settings()

