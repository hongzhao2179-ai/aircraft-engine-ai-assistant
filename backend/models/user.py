"""
用户模型 — 对应 Supabase auth.users 的简化表示。
"""

from dataclasses import dataclass
from typing import Optional


@dataclass
class User:
    user_id: str
    email: Optional[str] = None
    role: str = "user"  # "user" | "admin"

    @property
    def is_admin(self) -> bool:
        return self.role == "admin"

    @classmethod
    def from_jwt_payload(cls, payload: dict) -> "User":
        return cls(
            user_id=payload["sub"],
            email=payload.get("email"),
            role=(
                payload.get("role")
                or payload.get("app_metadata", {}).get("role", "user")
            ),
        )
