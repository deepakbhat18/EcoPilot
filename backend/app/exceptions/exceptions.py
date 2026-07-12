from typing import Any, Dict, Optional

class EcoPilotException(Exception):

    def __init__(
        self,
        status_code: int = 500,
        message: str = "An unexpected error occurred.",
        details: Optional[Any] = None
    ):
        self.status_code = status_code
        self.message = message
        self.details = details
        super().__init__(message)

class AuthenticationException(EcoPilotException):

    def __init__(self, message: str = "Invalid credentials.", details: Optional[Any] = None):
        super().__init__(status_code=401, message=message, details=details)

class AuthorizationException(EcoPilotException):

    def __init__(self, message: str = "Forbidden. Insufficient permissions.", details: Optional[Any] = None):
        super().__init__(status_code=403, message=message, details=details)

class NotFoundException(EcoPilotException):

    def __init__(self, message: str = "Resource not found.", details: Optional[Any] = None):
        super().__init__(status_code=404, message=message, details=details)

class AppValidationError(EcoPilotException):

    def __init__(self, message: str = "Validation failed.", details: Optional[Any] = None):
        super().__init__(status_code=422, message=message, details=details)

class DatabaseException(EcoPilotException):

    def __init__(self, message: str = "Database operation failed.", details: Optional[Any] = None):
        super().__init__(status_code=500, message=message, details=details)

