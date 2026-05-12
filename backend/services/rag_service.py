"""
RAG 编排服务 — 结合知识图谱检索和 LLM 生成。

流程:
1. 将用户问题转化为 Cypher 查询 (或直接关键词匹配)
2. 从 Neo4j 检索相关子图
3. 将子图信息注入系统提示词
4. 调用 LLM 生成最终回答
"""

from services.llm_service import call_llm, call_llm_stream
from services.neo4j_service import neo4j_service
from prompts.system_prompt import get_system_prompt
from config.settings import settings


async def rag_answer(question: str) -> str:
    """RAG 增强回答 — 完整模式"""
    # 1. 从知识图谱检索相关内容
    graph_context = await neo4j_service.query_knowledge_graph(question)

    # 2. 构建增强版系统提示词
    system = get_system_prompt(graph_context=graph_context)

    # 3. 调用 LLM
    full_prompt = f"{system}\n\n用户问题: {question}"
    return call_llm(full_prompt, model=settings.LLM_MODEL)


async def rag_answer_stream(question: str):
    """RAG 增强回答 — 流式模式"""
    graph_context = await neo4j_service.query_knowledge_graph(question)
    system = get_system_prompt(graph_context=graph_context)
    full_prompt = f"{system}\n\n用户问题: {question}"
    return call_llm_stream(full_prompt, model=settings.LLM_MODEL)
