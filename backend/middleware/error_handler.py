# Example: Custom error handling middleware
from fastapi import HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
import logging
from enum import Enum

logger = logging.getLogger(__name__)

class ErrorCode(Enum):
    # Authentication errors
    INVALID_TOKEN = "AUTH_001"
    EXPIRED_TOKEN = "AUTH_002"
    INSUFFICIENT_PERMISSIONS = "AUTH_003"
    
    # Database errors
    DATABASE_CONNECTION = "DB_001"
    RECORD_NOT_FOUND = "DB_002"
    DUPLICATE_RECORD = "DB_003"
    
    # Business logic errors
    INVALID_INPUT = "BL_001"
    RESOURCE_LIMIT_EXCEEDED = "BL_002"

class CustomException(Exception):
    def __init__(self, error_code: ErrorCode, message: str, details: dict = None):
        self.error_code = error_code
        self.message = message
        self.details = details or {}
        super().__init__(self.message)

async def custom_exception_handler(request: Request, exc: CustomException):
    logger.error(f"Custom exception: {exc.error_code.value} - {exc.message}", 
                extra={"details": exc.details})
    
    return JSONResponse(
        status_code=400,
        content={
            "error": {
                "code": exc.error_code.value,
                "message": exc.message,
                "details": exc.details
            }
        }
    )

async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.error(f"Validation error: {exc.errors()}")
    return JSONResponse(
        status_code=422,
        content={
            "error": {
                "code": "VALIDATION_ERROR",
                "message": "Input validation failed",
                "details": exc.errors()
            }
        }
    )
