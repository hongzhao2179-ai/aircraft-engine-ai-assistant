import uuid
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, UploadFile
from fastapi.responses import JSONResponse

from middleware.auth import require_admin
from services.file_processor import FileProcessor
from config.settings import settings

router = APIRouter(prefix="/api/admin", tags=["admin"])

UPLOAD_DIR = Path(settings.UPLOADS_DIR)
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


@router.post("/upload")
async def upload_file(
    file: UploadFile,
    _admin: dict = Depends(require_admin),
):
    """管理员上传文件，解析并抽取三元组存入 Neo4j"""
    if not file.filename:
        raise HTTPException(400, detail="没有文件名")

    supported = {".pdf", ".docx", ".txt", ".md", ".csv"}
    ext = Path(file.filename).suffix.lower()
    if ext not in supported:
        raise HTTPException(400, detail=f"不支持的文件类型: {ext}")

    save_path = UPLOAD_DIR / f"{uuid.uuid4().hex}{ext}"
    content = await file.read()
    save_path.write_bytes(content)

    processor = FileProcessor()
    result = await processor.process(str(save_path))

    return JSONResponse({
        "status": "ok",
        "file": file.filename,
        "triplets_extracted": result.get("triplet_count", 0),
        "details": result,
    })


@router.get("/files")
async def list_uploaded_files(_admin: dict = Depends(require_admin)):
    """列出已上传的文件"""
    if not UPLOAD_DIR.exists():
        return JSONResponse({"files": []})
    files = [f.name for f in UPLOAD_DIR.iterdir() if f.is_file()]
    return JSONResponse({"files": files})


@router.delete("/files/{filename}")
async def delete_uploaded_file(
    filename: str,
    _admin: dict = Depends(require_admin),
):
    """删除已上传的临时文件"""
    target = UPLOAD_DIR / filename
    if not target.exists():
        raise HTTPException(404, detail="文件不存在")
    target.unlink()
    return JSONResponse({"status": "deleted", "file": filename})
