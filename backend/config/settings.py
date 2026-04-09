import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PROJECT_NAME: str = "AeroMaint Copilot Backend"
    DASHSCOPE_API_KEY: str = os.getenv("DASHSCOPE_API_KEY", "")
    MODEL_NAME: str = "qwen-plus"
    
    # 允许的 CORS 来源
    ALLOWED_ORIGINS: list = ["*"]

settings = Settings()
