import os
import json
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from dotenv import load_dotenv
import dashscope
from http import HTTPStatus

# 加载环境变量
load_dotenv()

# 配置 DashScope API Key
dashscope.api_key = os.getenv("DASHSCOPE_API_KEY")

app = FastAPI(title="AeroMaint Copilot Backend")

# CORS 配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 生产环境建议指定具体域名，如 ["http://localhost:5173"]
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

def get_qwen_streaming_response(messages):
    """调用通义千问流式接口"""
    print(f"Calling DashScope with messages: {json.dumps(messages, ensure_ascii=False)}")
    try:
        responses = dashscope.Generation.call(
            model='qwen-plus',
            messages=messages,
            result_format='message',
            stream=True,
            incremental_output=True
        )
        
        for response in responses:
            if response.status_code == HTTPStatus.OK:
                content = response.output.choices[0]['message']['content']
                if content:
                    yield content
            else:
                error_msg = f"DashScope Error: {response.code} - {response.message}"
                print(error_msg)
                yield f"\n[Error] {error_msg}"
    except Exception as e:
        error_msg = f"Unexpected Error: {str(e)}"
        print(error_msg)
        yield f"\n[Error] {error_msg}"

@app.post("/chat")
async def chat(request: ChatRequest):
    if not dashscope.api_key:
        raise HTTPException(status_code=500, detail="DASHSCOPE_API_KEY not configured in .env")

    # 构造 DashScope 要求的 messages 格式
    formatted_messages = []
    
    # 添加历史记录
    if request.history:
        for msg in request.history:
            formatted_messages.append({
                "role": msg.role,
                "content": msg.content
            })
    
    # 添加当前用户消息
    formatted_messages.append({
        "role": "user",
        "content": request.message
    })

    if request.stream:
        return StreamingResponse(
            get_qwen_streaming_response(formatted_messages),
            media_type="text/event-stream"
        )
    else:
        # 非流式模式
        response = dashscope.Generation.call(
            model='qwen-plus',
            messages=formatted_messages,
            result_format='message',
        )
        if response.status_code == HTTPStatus.OK:
            return response.output.choices[0]['message']
        else:
            raise HTTPException(status_code=response.status_code, detail=response.message)

@app.get("/health")
async def health_check():
    return {"status": "ok", "api_key_configured": bool(dashscope.api_key)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
