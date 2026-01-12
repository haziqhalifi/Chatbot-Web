import importlib
import os

import jwt
import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient


@pytest.fixture(scope="function")
def app(monkeypatch):
    # Ensure JWT secret is consistent
    monkeypatch.setenv("JWT_SECRET", "test_secret")
    # Reload router to pick up env
    routes_chat = importlib.reload(importlib.import_module("routes.chat"))

    # Set API key for tests via import
    from config.settings import API_KEY_CREDITS
    API_KEY_CREDITS.clear()
    API_KEY_CREDITS.update({"k": 10})

    # Stub ChatService methods
    monkeypatch.setattr(routes_chat.ChatService, "create_new_session", staticmethod(lambda *a, **k: {"id": 1}))
    monkeypatch.setattr(routes_chat.ChatService, "get_user_sessions", staticmethod(lambda *a, **k: {"sessions": [], "total": 0}))
    monkeypatch.setattr(routes_chat.ChatService, "get_session_details", staticmethod(lambda *a, **k: {"id": 1, "title": "t"}))
    monkeypatch.setattr(routes_chat.ChatService, "get_session_messages", staticmethod(lambda *a, **k: {"messages": []}))
    monkeypatch.setattr(routes_chat.ChatService, "save_user_message", staticmethod(lambda *a, **k: {"id": 2}))
    monkeypatch.setattr(routes_chat.ChatService, "process_chat_message", staticmethod(lambda *a, **k: {"ok": True}))
    monkeypatch.setattr(routes_chat.ChatService, "update_session_title", staticmethod(lambda *a, **k: {"message": "Session title updated successfully"}))
    monkeypatch.setattr(routes_chat.ChatService, "delete_session", staticmethod(lambda *a, **k: {"message": "Session deleted successfully"}))

    app = FastAPI()
    app.include_router(routes_chat.router)
    return app


def make_token(user_id=1, secret="test_secret"):
    return jwt.encode({"user_id": user_id}, secret, algorithm="HS256")


@pytest.fixture
def client(app):
    with TestClient(app) as test_client:
        yield test_client


def test_create_session(client):
    token = make_token()
    resp = client.post("/chat/sessions", headers={"Authorization": f"Bearer {token}"}, json={"title": "hello"})
    assert resp.status_code == 200
    assert resp.json()["id"] == 1


def test_get_providers(client):
    resp = client.get("/chat/providers")
    assert resp.status_code == 200
    assert "providers" in resp.json()


def test_generate_chat_response(client):
    token = make_token()
    resp = client.post(
        "/chat/generate",
        headers={"Authorization": f"Bearer {token}", "x-api-key": "k"},
        json={"session_id": 1, "prompt": "hi", "message_type": "text"},
    )
    assert resp.status_code == 200
    assert resp.json()["ok"] is True


def test_update_and_delete(client):
    token = make_token()
    update = client.put(
        "/chat/sessions/1",
        headers={"Authorization": f"Bearer {token}"},
        json={"title": "new"},
    )
    assert update.status_code == 200

    delete = client.delete(
        "/chat/sessions/1",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert delete.status_code == 200
