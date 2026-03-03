import json
from jose import jwt
from backend.config import get_settings
from backend.models.user import UserRoleEnum

settings = get_settings()

def test_role_serialization():
    # Simulate what happens in auth.py
    email = "admin@example.com"
    role = UserRoleEnum.ADMIN  # This is the enum member
    
    # Simulate to_encode logic in auth_utils
    to_encode = {"sub": email, "role": role}
    
    try:
        # Some JWT libraries might fail here if 'role' is not a string
        token = jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)
        print("Encoded successfully")
        
        decoded = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        print(f"Decoded: {decoded}")
        print(f"Role type in decoded payload: {type(decoded.get('role'))}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_role_serialization()
