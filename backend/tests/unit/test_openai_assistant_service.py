import importlib
import types

import pytest

import services.openai_assistant_service as oas


def test_service_disabled(monkeypatch):
    monkeypatch.setattr(oas, "OPENAI_ASSISTANT_ENABLED", False)
    monkeypatch.setattr(oas, "OPENAI_API_KEY", "k")
    monkeypatch.setattr(oas, "OPENAI_ASSISTANT_ID", "asst")
    monkeypatch.setattr(oas, "_openai_service", None, raising=False)

    with pytest.raises(ValueError):
        oas.get_openai_assistant_service()


def test_get_or_create_thread_uses_existing(monkeypatch):
    # Enable service and stub client
    monkeypatch.setattr(oas, "OPENAI_ASSISTANT_ENABLED", True)
    monkeypatch.setattr(oas, "OPENAI_API_KEY", "k")
    monkeypatch.setattr(oas, "OPENAI_ASSISTANT_ID", "asst")
    monkeypatch.setattr(oas, "_openai_service", None, raising=False)

    fake_client = types.SimpleNamespace(
        beta=types.SimpleNamespace(
            threads=types.SimpleNamespace(
                retrieve=lambda tid: True,
                create=lambda: types.SimpleNamespace(id="t-new"),
                messages=types.SimpleNamespace(list=lambda **kwargs: types.SimpleNamespace(data=[])),
            ),
            runs=types.SimpleNamespace(
                create=lambda **kwargs: types.SimpleNamespace(id="r1", status="completed"),
                retrieve=lambda **kwargs: types.SimpleNamespace(id="r1", status="completed"),
            ),
        )
    )

    monkeypatch.setattr(oas, "OpenAI", lambda api_key=None: fake_client)

    service = oas.get_openai_assistant_service()
    thread_id = service.get_or_create_thread("existing")
    assert thread_id == "existing"
