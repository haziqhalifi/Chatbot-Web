import types

import pytest

import database.connection as connection_module


class FakeCursor:
    def __init__(self):
        self.executed = []

    def execute(self, query, *params):
        self.executed.append((query, params))
        return self

    def fetchone(self):
        return (1,)

    def close(self):
        return None


class FakeConnection:
    def __init__(self):
        self.cursor_obj = FakeCursor()
        self.autocommit = True
        self.closed = False

    def cursor(self):
        return self.cursor_obj

    def close(self):
        self.closed = True

    def rollback(self):
        return None


@pytest.fixture(autouse=True)
def reset_pool(monkeypatch):
    # Reset globals between tests
    monkeypatch.setattr(connection_module, "_connection_pool", None, raising=False)
    monkeypatch.setattr(connection_module, "_connection_counter", 0, raising=False)


@pytest.fixture
def fake_connect(monkeypatch):
    def _connect(*args, **kwargs):
        return FakeConnection()
    monkeypatch.setattr(connection_module, "pyodbc", types.SimpleNamespace(connect=_connect))
    return _connect


def test_get_connection_pool_initializes(fake_connect):
    pool = connection_module.get_connection_pool()
    assert pool is not None
    assert pool.active_connections >= 0


def test_get_and_return_connection(fake_connect):
    pool = connection_module.get_connection_pool()
    conn = pool.get_connection()
    assert isinstance(conn, FakeConnection)
    pool.return_connection(conn)
    # After return, active_connections should remain non-negative
    assert pool.active_connections >= 0


def test_format_timestamp_handles_types():
    from datetime import datetime

    now = datetime(2024, 1, 1, 12, 0, 0)
    assert connection_module.format_timestamp(None) == ""
    assert connection_module.format_timestamp("2024-01-01") == "2024-01-01"
    assert connection_module.format_timestamp(now).startswith("2024-01-01T12:00:00")
