import sys
import types

import pytest
from fastapi import HTTPException

# Ensure utils.chat can import even if optional deps (ollama) are missing
if "ollama" not in sys.modules:
    sys.modules["ollama"] = types.SimpleNamespace(chat=lambda **kwargs: {"message": {"content": "ok"}})

import utils.chat as chat_utils


def test_verify_api_key_success():
    key = chat_utils.verify_api_key("abc", {"abc": 1})
    assert key == "abc"


def test_verify_api_key_invalid():
    with pytest.raises(HTTPException):
        chat_utils.verify_api_key("missing", {})


def test_md_table_to_html_formats():
    md = """
| A | B |
|---|---|
| 1 | 2 |
"""
    html = chat_utils.md_table_to_html(md)
    assert "<table" in html
    assert "<th>A</th>" in html


def test_generate_response_with_patched_dependencies(monkeypatch):
    monkeypatch.setattr(chat_utils, "detect_language", lambda text: "english")
    monkeypatch.setattr(chat_utils, "get_language_instruction", lambda lang: "Use English")

    monkeypatch.setattr(chat_utils, "ollama", types.SimpleNamespace(chat=lambda **kwargs: {"message": {"content": "*ok*"}}))

    class Req:
        def __init__(self, prompt):
            self.prompt = prompt
            self.rag_enabled = False

    result = chat_utils.generate_response(Req("hello"), x_api_key="k", API_KEY_CREDITS={"k": 2})
    assert "ok" in result["response"]
