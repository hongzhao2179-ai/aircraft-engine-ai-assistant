"""
知识图谱相关模型 — 三元组、图谱查询结果。
"""

from dataclasses import dataclass, field
from typing import Optional


@dataclass
class Triplet:
    subject: str
    predicate: str
    object_: str  # 避开 Python 保留字 object
    confidence: float = 1.0
    source_file: Optional[str] = None

    def to_cypher_params(self) -> dict:
        return {
            "subject": self.subject,
            "predicate": self.predicate,
            "object": self.object_,
            "confidence": self.confidence,
            "source": self.source_file or "",
        }


@dataclass
class GraphQueryResult:
    nodes: list[dict] = field(default_factory=list)
    relationships: list[dict] = field(default_factory=list)
    cypher: str = ""


@dataclass
class FileProcessResult:
    file_name: str
    text_chunks: list[str] = field(default_factory=list)
    triplets: list[Triplet] = field(default_factory=list)
    error: Optional[str] = None

    @property
    def triplet_count(self) -> int:
        return len(self.triplets)

    def to_dict(self) -> dict:
        return {
            "file": self.file_name,
            "chunk_count": len(self.text_chunks),
            "triplet_count": self.triplet_count,
            "triplets": [
                {"s": t.subject, "p": t.predicate, "o": t.object_, "conf": t.confidence}
                for t in self.triplets
            ],
            "error": self.error,
        }
