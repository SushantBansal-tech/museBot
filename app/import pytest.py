import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from app import app

# server/test_app.py

client = TestClient(app)

@pytest.fixture
def mock_db():
    with patch("app.get_db") as mock_get_db:
        mock_db_instance = MagicMock()
        mock_get_db.return_value = mock_db_instance
        yield mock_db_instance

def test_chat_endpoint(mock_db):
    response = client.post("/api/museum/chat", json={"message": "Hello", "user_id": "12345"})
    assert response.status_code == 200
    assert "response" in response.json()
    assert "detected_language" in response.json()
    assert "language_name" in response.json()

    # Test empty message
    response = client.post("/api/museum/chat", json={"message": "", "user_id": "12345"})
    assert response.status_code == 400
    assert response.json()["detail"] == "Message cannot be empty"

def test_get_museums(mock_db):
    mock_db["museums"].find.return_value = [{"name": "Test Museum"}]
    response = client.get("/api/museum")
    assert response.status_code == 200
    assert response.json()["success"] is True
    assert len(response.json()["museums"]) > 0

def test_add_museums(mock_db):
    mock_db["museums"].insert_many.return_value.inserted_ids = [1, 2]
    response = client.post("/api/museum")
    assert response.status_code == 200
    assert response.json()["success"] is True
    assert "museums added" in response.json()["message"]

def test_create_booking(mock_db):
    mock_db["museums"].find_one.return_value = {"ticketPrice": 100}
    mock_db["bookings"].insert_one.return_value.inserted_id = "12345"
    response = client.post(
        "/api/bookings",
        json={
            "museumId": "12345",
            "visitorCount": 2,
            "visitDate": "2023-10-10T10:00:00Z",
        },
    )
    assert response.status_code == 200
    assert response.json()["success"] is True
    assert "booking" in response.json()

def test_get_bookings(mock_db):
    mock_db["bookings"].aggregate.return_value = [{"_id": "12345", "museumDetails": {"name": "Test Museum"}}]
    response = client.get("/api/bookings")
    assert response.status_code == 200
    assert response.json()["success"] is True
    assert len(response.json()["bookings"]) > 0