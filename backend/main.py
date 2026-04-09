from typing import List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import json

from config.settings import settings
from services.llm_service import llm_service
from services.neo4j_service import neo4j_service
from utils.prompt_builder import prompt_builder

app = FastAPI(title=settings.PROJECT_NAME)

# CORS 配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 数据模型
class Message(BaseModel):
    role: str
    content: str
    timestamp: Optional[int] = None

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[Message]] = []
    stream: Optional[bool] = True

@app.post("/chat")
async def chat(request: ChatRequest):
    if not settings.DASHSCOPE_API_KEY:
        raise HTTPException(status_code=500, detail="DASHSCOPE_API_KEY not configured in .env")

    # 1. 查询知识图谱 (目前返回默认占位符)
    kg_result = await neo4j_service.query_knowledge(request.message)
    
    # 2. 构造提示词消息列表
    # 将 history 模型列表转为 dict 列表
    history_dicts = [{"role": msg.role, "content": msg.content} for msg in request.history] if request.history else []
    
    formatted_messages = prompt_builder.build_chat_messages(
        user_message=request.message,
        history=history_dicts,
        kg_result=kg_result
    )
    # 🔍 [DEBUG] 新增日志：检查 formatted_messages 列表内容
    print(f"🔍 [DEBUG] formatted_messages before LLM call: {json.dumps(formatted_messages, ensure_ascii=False, indent=2)}")
    if request.stream:
        return StreamingResponse(
            llm_service.get_streaming_response(formatted_messages),
            media_type="text/event-stream"
        )
    else:
        # 非流式模式
        response = llm_service.get_non_streaming_response(formatted_messages)
        if "content" in response:
            return response
        else:
            raise HTTPException(status_code=500, detail="Unexpected response from LLM service")

@app.get("/health")
async def health_check():
    return {
        "status": "ok", 
        "api_key_configured": bool(settings.DASHSCOPE_API_KEY),
        "project_name": settings.PROJECT_NAME
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
