"""
LLM 调用服务 — 支持 OpenAI 兼容接口 (包括通义千问)。
"""

from openai import AsyncOpenAI, OpenAI  # type: ignore
from config.settings import settings

_sync_client = OpenAI(
    api_key=settings.LLM_API_KEY,
    base_url=settings.LLM_BASE_URL,
    timeout=settings.LLM_TIMEOUT,
)

_async_client = AsyncOpenAI(
    api_key=settings.LLM_API_KEY,
    base_url=settings.LLM_BASE_URL,
    timeout=settings.LLM_TIMEOUT,
)


def call_llm(prompt: str, model: str | None = None, system: str = "") -> str:
    """同步调用 LLM — 单条 user prompt + 可选的 system"""
    m = model or settings.LLM_MODEL
    messages = []
    if system:
        messages.append({"role": "system", "content": system})
    messages.append({"role": "user", "content": prompt})
    resp = _sync_client.chat.completions.create(
        model=m,
        messages=messages,
        temperature=settings.LLM_TEMPERATURE,
    )
    return resp.choices[0].message.content or ""


async def call_llm_stream(prompt: str, model: str | None = None, system: str = ""):
    """流式调用 LLM — 单条 user prompt + 可选的 system"""
    m = model or settings.LLM_MODEL
    messages = []
    if system:
        messages.append({"role": "system", "content": system})
    messages.append({"role": "user", "content": prompt})
    resp = await _async_client.chat.completions.create(
        model=m,
        messages=messages,
        temperature=settings.LLM_TEMPERATURE,
        stream=True,
    )
    async for chunk in resp:
        delta = chunk.choices[0].delta.content
        if delta:
            yield delta


# ---------- 完整 messages 数组（支持多轮对话） ----------

def call_llm_with_messages(messages: list, model: str | None = None) -> str:
    """同步调用 LLM — 传入完整的 messages 数组（含 system/history/当前 user）"""
    m = model or settings.LLM_MODEL
    resp = _sync_client.chat.completions.create(
        model=m,
        messages=messages,
        temperature=settings.LLM_TEMPERATURE,
    )
    return resp.choices[0].message.content or ""


async def call_llm_with_messages_stream(messages: list, model: str | None = None):
    """流式调用 LLM — 传入完整的 messages 数组"""
    m = model or settings.LLM_MODEL
    resp = await _async_client.chat.completions.create(
        model=m,
        messages=messages,
        temperature=settings.LLM_TEMPERATURE,
        stream=True,
    )
    async for chunk in resp:
        delta = chunk.choices[0].delta.content
        if delta:
            yield delta
