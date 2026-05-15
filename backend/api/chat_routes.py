import json
from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from services.rag_service import rag_answer, rag_answer_stream

router = APIRouter(prefix="/api/chat", tags=["chat"])


class ChatRequest(BaseModel):
    message: str
    history: list = []
    stream: bool = False


@router.post("/")
async def chat(body: ChatRequest, request: Request):
    """统一对话接口 — 支持流式 / 非流式 + 多轮历史"""
    try:
        if body.stream:
            return StreamingResponse(
                _event_stream(body.message, body.history),
                media_type="text/event-stream",
            )
        response = await rag_answer(body.message, body.history)
        return {"response": response}
    except Exception as e:
        return {"error": str(e)}


async def _event_stream(message: str, history: list):
    full_response = ""
    async for chunk in rag_answer_stream(message, history):
        full_response += chunk
        yield f"data: {json.dumps({'delta': chunk}, ensure_ascii=False)}\n\n"
    yield f"data: {json.dumps({'done': True, 'full': full_response}, ensure_ascii=False)}\n\n"
