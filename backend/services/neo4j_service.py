"""
Neo4j 知识图谱服务 — 三元组写入与查询。
"""

import asyncio
from typing import Optional
from models.knowledge import Triplet, GraphQueryResult
from config.settings import settings


class Neo4jService:
    def __init__(self):
        self._driver = None
        self._uri = settings.NEO4J_URI
        self._user = settings.NEO4J_USER
        self._password = settings.NEO4J_PASSWORD

    def _get_driver(self):
        """懒加载 Neo4j 驱动"""
        if self._driver is None:
            from neo4j import GraphDatabase  # type: ignore
            self._driver = GraphDatabase.driver(
                self._uri, auth=(self._user, self._password)
            )
        return self._driver

    def _add_triplets_sync(self, triplets: list[Triplet]) -> int:
        cypher = """
        UNWIND $batch AS t
        MERGE (s:Entity {name: t.subject})
        MERGE (o:Entity {name: t.object})
        MERGE (s)-[r:RELATED_TO {type: t.predicate}]->(o)
        ON CREATE SET r.confidence = t.confidence, r.source = t.source
        """
        batch = [t.to_cypher_params() for t in triplets]
        driver = self._get_driver()
        with driver.session() as session:
            result = session.run(cypher, batch=batch)
            result.consume()
        return len(triplets)

    async def add_triplets(self, triplets: list[Triplet]) -> int:
        """批量写入三元组到 Neo4j — MERGE 避免重复"""
        return await asyncio.to_thread(self._add_triplets_sync, triplets)

    def _query_graph_sync(self, question: str) -> str:
        keywords = self._extract_keywords(question)
        if not keywords:
            return ""

        cypher = """
        MATCH (n:Entity)
        WHERE any(k in $keywords WHERE toLower(k) IN toLower(n.name))
        MATCH (n)-[r]-()
        RETURN distinct n.name AS node, type(r) AS relation, r.confidence AS confidence
        LIMIT 50
        """
        try:
            driver = self._get_driver()
            with driver.session() as session:
                result = session.run(cypher, keywords=keywords)
                records = [dict(r) for r in result]
        except Exception:
            records = []

        if not records:
            return ""

        lines = [
            f"- {r['node']}: {r['relation']} (置信度: {r.get('confidence', 'N/A')})"
            for r in records
        ]
        return "\n".join(lines)

    async def query_knowledge_graph(self, question: str) -> str:
        """根据用户问题从知识图谱查询相关知识 — 关键词匹配"""
        return await asyncio.to_thread(self._query_graph_sync, question)

    async def query_knowledge(self, question: str) -> str:
        """向后兼容 — 同 query_knowledge_graph"""
        return await self.query_knowledge_graph(question)

    def _extract_keywords(self, text: str) -> list[str]:
        """简单关键词提取 — 取中文词语 + 英文单词"""
        import re
        chinese = re.findall(r"[一-鿿]{2,}", text)
        english = re.findall(r"[A-Za-z]{3,}", text)
        return chinese[:5] + english[:5]

    def close(self):
        if self._driver:
            self._driver.close()
            self._driver = None


neo4j_service = Neo4jService()
