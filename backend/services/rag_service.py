"""
RAG 编排服务 — 结合知识图谱检索和 LLM 生成。

流程:
1. 将用户问题转化为 Cypher 查询 (或直接关键词匹配)
2. 从 Neo4j 检索相关子图
3. 将子图信息注入系统提示词
4. 调用 LLM 生成最终回答
"""

from services.llm_service import call_llm_with_messages, call_llm_with_messages_stream
from services.neo4j_service import neo4j_service
from prompts.system_prompt import get_system_prompt
from config.settings import settings


async def rag_answer(question: str, history: list | None = None) -> str:
    """RAG 增强回答 — 先查知识图谱，再调用 LLM，支持多轮历史"""
    graph_context = await neo4j_service.query_knowledge_graph(question)
    system = get_system_prompt(graph_context=graph_context)

    messages = [{"role": "system", "content": system}]
    if history:
        messages.extend(history)
    messages.append({"role": "user", "content": question})

    return call_llm_with_messages(messages, model=settings.LLM_MODEL)


async def rag_answer_stream(question: str, history: list | None = None):
    """RAG 增强回答 — 流式模式，支持多轮历史"""
    graph_context = await neo4j_service.query_knowledge_graph(question)
    system = get_system_prompt(graph_context=graph_context)

    messages = [{"role": "system", "content": system}]
    if history:
        messages.extend(history)
    messages.append({"role": "user", "content": question})

    async for chunk in call_llm_with_messages_stream(messages, model=settings.LLM_MODEL):
        yield chunk
