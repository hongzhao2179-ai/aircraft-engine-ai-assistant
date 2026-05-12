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


def call_llm(prompt: str, model: str | None = None) -> str:
    """同步调用 LLM，返回完整字符串"""
    m = model or settings.LLM_MODEL
    resp = _sync_client.chat.completions.create(
        model=m,
        messages=[{"role": "user", "content": prompt}],
        temperature=settings.LLM_TEMPERATURE,
    )
    return resp.choices[0].message.content or ""


async def call_llm_stream(prompt: str, model: str | None = None):
    """流式调用 LLM，异步生成每个 token chunk"""
    m = model or settings.LLM_MODEL
    resp = await _async_client.chat.completions.create(
        model=m,
        messages=[{"role": "user", "content": prompt}],
        temperature=settings.LLM_TEMPERATURE,
        stream=True,
    )
    async for chunk in resp:
        delta = chunk.choices[0].delta.content
        if delta:
            yield delta
