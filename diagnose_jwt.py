from datetime import timedelta
from jose import jwt, JWTError
from backend.config import get_settings
from backend.api import auth_utils

settings = get_settings()

def test_jwt():
    print(f"Secret Key: {settings.secret_key}")
    print(f"Algorithm: {settings.algorithm}")
    
    # Simulate login
    email = "admin@example.com"
    role = "admin"
    token = auth_utils.create_access_token(subject=email, role=role)
    print(f"Generated Token: {token}")
    
    # Simulate validation
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        print(f"Decoded Payload: {payload}")
        if payload.get("sub") == email:
            print("Validation Success: Sub matches")
        else:
            print("Validation Failure: Sub mismatch")
    except JWTError as e:
        print(f"Validation Failure: {e}")

if __name__ == "__main__":
    test_jwt()
