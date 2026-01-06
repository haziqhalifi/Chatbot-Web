import importlib
import os

import pytest


def reload_settings(monkeypatch, env):
    # Prevent .env from repopulating secrets during reload
    monkeypatch.setenv("OPENAI_API_KEY", env.get("OPENAI_API_KEY", ""))
    monkeypatch.setenv("OPENAI_ASSISTANT_ID", env.get("OPENAI_ASSISTANT_ID", ""))
    if "API_KEY" in env:
        monkeypatch.setenv("API_KEY", env["API_KEY"])
    else:
        monkeypatch.delenv("API_KEY", raising=False)

    import config.settings as settings
    return importlib.reload(settings)


def test_defaults_without_openai(monkeypatch):
    settings = reload_settings(monkeypatch, {
        "OPENAI_API_KEY": "",
        "OPENAI_ASSISTANT_ID": "",
        "API_KEY": "dev-key",
    })

    assert settings.OPENAI_ASSISTANT_ENABLED is False
    assert isinstance(settings.AI_PROVIDERS, list)
    assert settings.DEFAULT_AI_PROVIDER == "openai"
    assert settings.API_KEY_CREDITS == {"dev-key": 100}


def test_openai_enabled(monkeypatch):
    settings = reload_settings(monkeypatch, {
        "OPENAI_API_KEY": "k-123",
        "OPENAI_ASSISTANT_ID": "asst_123",
        "API_KEY": "prod-key",
    })

    assert settings.OPENAI_ASSISTANT_ENABLED is True
    assert settings.AI_PROVIDERS == ["openai"]
    assert settings.DEFAULT_AI_PROVIDER == "openai"
    assert settings.API_KEY_CREDITS == {"prod-key": 100}
