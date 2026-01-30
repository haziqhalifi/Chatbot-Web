import pytest
from fastapi import HTTPException

import utils.chat as chat_utils


def test_verify_api_key_success():
    key = chat_utils.verify_api_key("abc", {"abc": 1})
    assert key == "abc"


def test_verify_api_key_invalid():
    with pytest.raises(HTTPException):
        chat_utils.verify_api_key("missing", {})
