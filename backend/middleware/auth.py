"""
权限中间件 — 基于 Supabase JWT 的用户认证与角色校验。

流程:
1. 从 Authorization header 解析 JWT token
2. 校验签名 (Supabase JWT secret)
3. 解码 claims, 提取 user_id 和 role
4. 普通接口只需有效 token; 管理员接口额外校验 role == "admin"
"""

import jwt
from fastapi import Depends, HTTPException, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from config.settings import settings

security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    """解码 JWT, 返回 payload (含 user_id, role 等 claims)"""
    try:
        payload = jwt.decode(
            credentials.credentials,
            settings.SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
        )
    except jwt.ExpiredSignatureError:
        raise HTTPException(401, detail="Token 已过期")
    except jwt.InvalidTokenError:
        raise HTTPException(401, detail="Token 无效")

    uid = payload.get("sub")
    if not uid:
        raise HTTPException(401, detail="Token 缺少用户标识")

    return payload


def require_admin(user: dict = Depends(get_current_user)) -> dict:
    """管理员权限校验 — role 必须为 admin"""
    role = user.get("role") or user.get("app_metadata", {}).get("role", "user")
    if role != "admin":
        raise HTTPException(403, detail="需要管理员权限")
    return user


def optional_user(
    request: Request,
) -> dict | None:
    """可选认证 — 有 token 就解析, 没有返回 None (兼容现有无认证聊天)"""
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        return None
    try:
        return jwt.decode(
            auth[7:],
            settings.SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
        )
    except jwt.InvalidTokenError:
        return None
