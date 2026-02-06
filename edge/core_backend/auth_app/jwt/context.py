# auth_app/jwt/context.py

from dataclasses import dataclass
from typing import List


@dataclass(frozen=True)
class AuthContext:
    user_id: str
    client_id: str
    roles: List[str]
    scopes: List[str]
    issued_at: int
    expires_at: int

    def has_scope(self, scope: str) -> bool:
        return scope in self.scopes

    def has_role(self, role: str) -> bool:
        return role in self.roles
