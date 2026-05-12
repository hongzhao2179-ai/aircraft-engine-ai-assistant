"""
文件处理服务 — 文档解析、分块、三元组抽取、写入 Neo4j。
"""

import json
from pathlib import Path
from typing import Any

from models.knowledge import FileProcessResult, Triplet
from services.llm_service import call_llm
from services.neo4j_service import neo4j_service
from prompts.extraction_prompt import EXTRACTION_SYSTEM_PROMPT, build_extraction_prompt
from config.settings import settings


CHUNK_SIZE = 2000  # 每个文本块的最大字符数
CHUNK_OVERLAP = 200  # 块之间重叠字符数，避免截断语义


def _chunk_text(text: str, size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> list[str]:
    """简单按字符数分块，带重叠"""
    chunks = []
    start = 0
    while start < len(text):
        end = start + size
        chunks.append(text[start:end].strip())
        start = end - overlap
    return chunks


def _extract_text(file_path: str) -> str:
    """读取文件文本内容 — 目前仅支持纯文本类格式"""
    ext = Path(file_path).suffix.lower()
    raw = Path(file_path).read_bytes()

    if ext in (".txt", ".md", ".csv"):
        return raw.decode("utf-8", errors="replace")
    elif ext == ".pdf":
        return _extract_pdf(raw)
    elif ext == ".docx":
        return _extract_docx(raw)
    else:
        raise ValueError(f"不支持的提取格式: {ext}")


def _extract_pdf(raw: bytes) -> str:
    """PDF 文本提取"""
    try:
        import pymupdf  # type: ignore
    except ImportError:
        raise ImportError("安装 pymupdf: pip install PyMuPDF")

    doc = pymupdf.open(stream=raw, filetype="pdf")
    return "\n".join(page.get_text() for page in doc)


def _extract_docx(raw: bytes) -> str:
    """DOCX 文本提取"""
    try:
        import io
        from docx import Document  # type: ignore
    except ImportError:
        raise ImportError("安装 python-docx: pip install python-docx")

    doc = Document(io.BytesIO(raw))
    return "\n".join(p.text for p in doc.paragraphs)


async def _extract_triplets(text_chunk: str, source_file: str) -> list[Triplet]:
    """调用 LLM 抽取三元组"""
    user_prompt = build_extraction_prompt(text_chunk)
    full = f"{EXTRACTION_SYSTEM_PROMPT}\n\n{user_prompt}"

    try:
        raw_response = call_llm(full, model=settings.LLM_MODEL)
        cleaned = raw_response.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("```")[1]
            if cleaned.startswith("json"):
                cleaned = cleaned[4:]
            cleaned = cleaned.rsplit("```", 1)[0]

        parsed = json.loads(cleaned)
        return [
            Triplet(
                subject=t["subject"],
                predicate=t["predicate"],
                object_=t.get("object") or t.get("object_", ""),
                confidence=t.get("confidence", 1.0),
                source_file=source_file,
            )
            for t in parsed
        ]
    except (json.JSONDecodeError, KeyError) as e:
        print(f"[Triple Extract] JSON 解析失败: {e}")
        return []


class FileProcessor:
    """文件处理编排器"""

    async def process(self, file_path: str) -> dict[str, Any]:
        """
        完整处理流程: 读取 -> 分块 -> 抽取三元组 -> 写入 Neo4j
        返回 FileProcessResult.to_dict()
        """
        file_name = Path(file_path).name
        result = FileProcessResult(file_name=file_name)

        # 1. 提取文本
        try:
            text = _extract_text(file_path)
        except Exception as e:
            result.error = f"文本提取失败: {e}"
            return result.to_dict()

        # 2. 分块
        chunks = _chunk_text(text)
        result.text_chunks = chunks

        # 3. 逐块抽取三元组
        all_triplets: list[Triplet] = []
        for chunk in chunks:
            triplets = await _extract_triplets(chunk, file_name)
            all_triplets.extend(triplets)
        result.triplets = all_triplets

        # 4. 写入 Neo4j
        if all_triplets:
            await neo4j_service.add_triplets(all_triplets)

        return result.to_dict()
