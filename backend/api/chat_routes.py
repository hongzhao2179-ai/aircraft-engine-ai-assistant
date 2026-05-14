import json
from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse

from services.llm_service import call_llm, call_llm_stream
from prompts.system_prompt import get_system_prompt
from prompts.user_prompt import get_formatted_prompt
from config.settings import settings

router = APIRouter(prefix="/api/chat", tags=["chat"])


@router.post("/")
async def chat(question: str, request: Request):
    """普通用户对话接口 — 完整回复"""
    system = get_system_prompt()
    user = get_formatted_prompt(question)
    try:
        response = call_llm(user, model=settings.LLM_MODEL, system=system)
        return {"response": response}
    except Exception as e:
        return {"error": str(e)}


@router.post("/stream")
async def chat_stream(question: str, request: Request):
    """流式对话接口"""
    system = get_system_prompt()
    user = get_formatted_prompt(question)

    async def event_stream():
        full_response = ""
        async for chunk in call_llm_stream(user, model=settings.LLM_MODEL, system=system):
            full_response += chunk
            yield json.dumps({"delta": chunk}, ensure_ascii=False)

        yield json.dumps({"done": True, "full": full_response}, ensure_ascii=False)

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
    )
