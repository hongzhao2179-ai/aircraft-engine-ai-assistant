from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from config.settings import settings
from api import chat_routes, admin_routes

app = FastAPI(title="IT助手后端API", version="0.2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat_routes.router)
app.include_router(admin_routes.router)


@app.get("/")
def read_root():
    return {"status": "ok", "service": "IT助手后端API", "version": "0.2.0"}


@app.get("/health")
def health_check():
    return {"api": "healthy", "llm_provider": settings.LLM_PROVIDER}


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"error": "服务器内部错误", "detail": str(exc)},
    )


if __name__ == "__main__":
    import uvicorn
    print("[OK] SUPABASE_JWT_SECRET:", settings.SUPABASE_JWT_SECRET[:5] + "***")
    print("[OK] NEO4J_URI:", settings.NEO4J_URI)
    print("[OK] LLM_BASE_URL:", settings.LLM_BASE_URL)
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.RELOAD,
    )
