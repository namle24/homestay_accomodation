from typing import Generator
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
import os
import sys

# Ensure backend can be imported
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from backend.db import Base, get_db
from backend.main import app
from backend.models.user import User, UserRoleEnum
from backend.models.room import Room
from backend.models.booking import Booking
from backend.models.ota_sync import OTASync
from backend.api.auth_utils import get_password_hash, create_access_token

SQLALCHEMY_DATABASE_URL = "sqlite+pysqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
    future=True,
)
TestingSessionLocal = sessionmaker(
    autocommit=False, autoflush=False, bind=engine, future=True
)

def override_get_db() -> Generator:
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="session", autouse=True)
def create_test_db() -> Generator:
    # IMPORTANT: Import all models before calling create_all
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture(autouse=True)
def clean_db() -> Generator:
    # Clear data instead of dropping tables for speed and to avoid 'no such table' issues
    with engine.connect() as conn:
        for table in reversed(Base.metadata.sorted_tables):
            conn.execute(table.delete())
        conn.commit()
    yield

@pytest.fixture
def client() -> TestClient:
    return TestClient(app)

@pytest.fixture
def db() -> Generator:
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()

def get_token_headers(client: TestClient, email: str, role: UserRoleEnum):
    session = TestingSessionLocal()
    user = session.query(User).filter(User.email == email).first()
    if not user:
        user = User(
            email=email,
            hashed_password=get_password_hash("password123"),
            full_name=f"Test {role.value}",
            role=role,
            is_active=True
        )
        session.add(user)
        session.commit()
        session.refresh(user)
    session.close()

    access_token = create_access_token(subject=email)
    return {"Authorization": f"Bearer {access_token}"}

@pytest.fixture
def token_headers_admin(client: TestClient):
    return get_token_headers(client, "admin@example.com", UserRoleEnum.ADMIN)

@pytest.fixture
def token_headers_user(client: TestClient):
    return get_token_headers(client, "user@example.com", UserRoleEnum.USER)
