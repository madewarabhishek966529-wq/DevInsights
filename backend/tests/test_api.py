import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "DevInsights"
    assert "github_api" in data

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["platform"] == "DevInsights"
    assert "docs_url" in data

def test_compare_missing_params():
    response = client.get("/api/developers/compare?usernames=torvalds")
    assert response.status_code == 400
    assert "at least 2" in response.json()["detail"].lower()
