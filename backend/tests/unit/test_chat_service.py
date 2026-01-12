import types

import pytest
from fastapi import HTTPException

import services.chat_service as chat_service


@pytest.fixture(autouse=True)
def reset_openai_service(monkeypatch):
    monkeypatch.setattr(chat_service, "get_openai_assistant_service", lambda: None, raising=False)


def test_create_new_session_uses_default_provider(monkeypatch):
    saved_bot = {}

    def fake_create_chat_session(user_id, title, provider):
        return {"id": 1, "user_id": user_id, "title": title, "ai_provider": provider}

    def fake_save_bot_message(session_id, content, message_type="text"):
        saved_bot["content"] = content
        return {"id": 99, "content": content}

    monkeypatch.setattr(chat_service, "create_chat_session", fake_create_chat_session)
    monkeypatch.setattr(chat_service.ChatService, "save_bot_message", staticmethod(fake_save_bot_message))

    session = chat_service.ChatService.create_new_session(user_id=42, title=None, ai_provider=None)

    assert session["ai_provider"] == chat_service.DEFAULT_AI_PROVIDER
    assert "Greetings!" in saved_bot["content"]


def test_process_chat_message_success(monkeypatch):
    monkeypatch.setattr(chat_service, "OPENAI_ASSISTANT_ENABLED", True)
    monkeypatch.setattr(chat_service, "DEFAULT_AI_PROVIDER", "openai")

    # Session exists
    monkeypatch.setattr(chat_service, "get_chat_session", lambda sid, uid: {"id": sid, "ai_provider": "openai", "openai_thread_id": None})
    # Mock get_chat_messages to return empty history
    monkeypatch.setattr(chat_service, "get_chat_messages", lambda *args, **kwargs: [])
    # Save user/bot messages
    monkeypatch.setattr(chat_service.ChatService, "save_user_message", staticmethod(lambda *args, **kwargs: {"id": 1, "content": kwargs.get("content", "")}))
    monkeypatch.setattr(chat_service.ChatService, "save_bot_message", staticmethod(lambda *args, **kwargs: {"id": 2, "content": args[1] if len(args) > 1 else ""}))

    fake_service = types.SimpleNamespace(
        generate_response=lambda prompt, thread_id=None, history=None: {
            "response": "pong",
            "duration": 0.1,
            "thread_id": "t1",
            "map_commands": [],
        }
    )
    monkeypatch.setattr(chat_service, "get_openai_assistant_service", lambda: fake_service)
    # Patch update_session_metadata at the database.chat module where it's imported from
    monkeypatch.setattr("database.chat.update_session_metadata", lambda sid, data: True, raising=False)

    result = chat_service.ChatService.process_chat_message(
        session_id=1,
        user_id=7,
        prompt="ping",
        x_api_key="abc",
        api_key_credits={"abc": 10},
        message_type="text",
    )

    assert result["ai_response"]["response"] == "pong"
    assert result["ai_response"]["provider"] == "openai"
    assert result["user_message"]["id"] == 1
    assert result["bot_message"]["id"] == 2


def test_process_chat_message_missing_session(monkeypatch):
    monkeypatch.setattr(chat_service, "get_chat_session", lambda sid, uid: None)

    with pytest.raises(HTTPException) as exc:
        chat_service.ChatService.process_chat_message(1, 7, "hi", None, {}, "text")

    assert exc.value.status_code == 404


def test_process_chat_message_openai_error(monkeypatch):
    monkeypatch.setattr(chat_service, "get_chat_session", lambda sid, uid: {"id": sid, "ai_provider": "openai", "openai_thread_id": None})
    monkeypatch.setattr(chat_service.ChatService, "save_user_message", staticmethod(lambda *args, **kwargs: {"id": 1}))

    def fake_generate_response(*args, **kwargs):
        raise RuntimeError("boom")

    fake_service = types.SimpleNamespace(generate_response=fake_generate_response)
    monkeypatch.setattr(chat_service, "get_openai_assistant_service", lambda: fake_service)

    with pytest.raises(HTTPException) as exc:
        chat_service.ChatService.process_chat_message(1, 7, "hi", None, {}, "text")

    assert exc.value.status_code == 502


def test_get_session_context_formats(monkeypatch):
    messages = [
        {"sender_type": "user", "content": "Hi"},
        {"sender_type": "bot", "content": "Hello"},
    ]
    monkeypatch.setattr(chat_service, "get_chat_messages", lambda *args, **kwargs: messages)

    context = chat_service.ChatService.get_session_context(session_id=1, user_id=1, last_messages=2)
    assert "Human: Hi" in context
    assert "Assistant: Hello" in context
