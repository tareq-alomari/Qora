from pydantic import BaseModel, Field
from typing import Optional


class ValidationCheck(BaseModel):
    passed: bool
    details: str


class ValidationResponse(BaseModel):
    valid: bool
    confidence: float = Field(ge=0.0, le=1.0)
    checks: dict[str, ValidationCheck]
    reasons: list[str] = []
    suggestions: list[str] = []


class HealthResponse(BaseModel):
    status: str
    model: str
    version: str
