from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # 服务器
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    RELOAD: bool = True

    # LLM 配置
    LLM_PROVIDER: str = "openai"       # "openai" | "qwen" | "custom"
    LLM_MODEL: str = "gpt-4o-mini"
    LLM_API_KEY: str = ""
    LLM_BASE_URL: str | None = None
    LLM_TEMPERATURE: float = 0.3
    LLM_TIMEOUT: int = 30

    # Supabase 配置
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""
    SUPABASE_JWT_SECRET: str = ""

    # Neo4j 配置
    NEO4J_URI: str = "bolt://localhost:7687"
    NEO4J_USER: str = "neo4j"
    NEO4J_PASSWORD: str = ""

    # 文件上传
    UPLOADS_DIR: str = "./uploads"

    class Config:
        env_file = ".env"


settings = Settings()
