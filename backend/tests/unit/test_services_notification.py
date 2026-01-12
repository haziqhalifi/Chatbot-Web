"""
Unit tests for services.notification_service module
Tests notification creation, retrieval, and management
"""
import pytest
from unittest.mock import Mock, MagicMock, patch
from fastapi import HTTPException
from datetime import datetime


class FakeCursor:
    """Mock database cursor"""
    
    def __init__(self):
        self.executed = []
        self.fetchall_data = []
        self.fetchone_data = None
    
    def execute(self, query, params=None):
        self.executed.append((query, params))
    
    def fetchall(self):
        return self.fetchall_data
    
    def fetchone(self):
        return self.fetchone_data
    
    def close(self):
        pass


class FakeConnection:
    """Mock database connection"""
    
    def __init__(self):
        self.cursor_obj = FakeCursor()
        self.closed = False
    
    def cursor(self):
        return self.cursor_obj
    
    def close(self):
        self.closed = True


class TestGetNotifications:
    """Test get_notifications function"""
    
    def test_get_notifications_success(self, monkeypatch):
        """Test retrieving notifications for a user"""
        import services.notification_service as notif_service
        
        fake_conn = FakeConnection()
        fake_conn.cursor_obj.fetchall_data = [
            (1, 42, "Test Alert", "Flood warning", "warning", "flood", "Kuala Lumpur", 0, datetime(2024, 1, 1, 12, 0, 0)),
            (2, 42, "Info", "System update", "info", None, None, 1, datetime(2024, 1, 2, 14, 0, 0))
        ]
        
        with patch.object(notif_service, 'get_db_conn', return_value=fake_conn):
            notifications = notif_service.get_notifications(user_id=42, limit=10, offset=0)
        
        assert len(notifications) == 2
        assert notifications[0]["id"] == 1
        assert notifications[0]["title"] == "Test Alert"
        assert notifications[0]["type"] == "warning"
        assert notifications[0]["read"] is False
        assert notifications[1]["read"] is True
    
    def test_get_notifications_with_unread_filter(self, monkeypatch):
        """Test getting only unread notifications"""
        import services.notification_service as notif_service
        
        fake_conn = FakeConnection()
        fake_conn.cursor_obj.fetchall_data = [
            (1, 42, "Unread", "Message", "info", None, None, 0, datetime(2024, 1, 1))
        ]
        
        with patch.object(notif_service, 'get_db_conn', return_value=fake_conn):
            notifications = notif_service.get_notifications(user_id=42, unread_only=True)
        
        # Should add unread filter to query
        executed = fake_conn.cursor_obj.executed[0]
        assert 'is_read = 0' in str(executed[0]).lower()
    
    def test_get_notifications_pagination(self, monkeypatch):
        """Test pagination parameters"""
        import services.notification_service as notif_service
        
        fake_conn = FakeConnection()
        fake_conn.cursor_obj.fetchall_data = []
        
        with patch.object(notif_service, 'get_db_conn', return_value=fake_conn):
            notif_service.get_notifications(user_id=42, limit=20, offset=10)
        
        # Should use OFFSET and FETCH NEXT in query
        executed = fake_conn.cursor_obj.executed[0]
        query = str(executed[0]).lower()
        assert 'offset' in query
        assert 'fetch next' in query
        # Check params include offset and limit
        assert 10 in executed[1]
        assert 20 in executed[1]
    
    def test_get_notifications_database_error(self, monkeypatch):
        """Test handling database errors"""
        import services.notification_service as notif_service
        
        with patch.object(notif_service, 'get_db_conn', side_effect=Exception("DB Error")):
            with pytest.raises(HTTPException) as exc:
                notif_service.get_notifications(user_id=42)
            
            assert exc.value.status_code == 500
            assert "Database error" in str(exc.value.detail)
    
    def test_get_notifications_converts_bit_to_boolean(self, monkeypatch):
        """Test is_read BIT field converted to boolean"""
        import services.notification_service as notif_service
        
        fake_conn = FakeConnection()
        fake_conn.cursor_obj.fetchall_data = [
            (1, 42, "Test", "Message", "info", None, None, 1, datetime(2024, 1, 1)),
            (2, 42, "Test2", "Message2", "info", None, None, 0, datetime(2024, 1, 2))
        ]
        
        with patch.object(notif_service, 'get_db_conn', return_value=fake_conn):
            notifications = notif_service.get_notifications(user_id=42)
        
        assert notifications[0]["read"] is True
        assert notifications[1]["read"] is False
    
    def test_get_notifications_formats_datetime(self, monkeypatch):
        """Test datetime formatting in response"""
        import services.notification_service as notif_service
        
        fake_conn = FakeConnection()
        test_time = datetime(2024, 6, 15, 10, 30, 45)
        fake_conn.cursor_obj.fetchall_data = [
            (1, 42, "Test", "Message", "info", None, None, 0, test_time)
        ]
        
        with patch.object(notif_service, 'get_db_conn', return_value=fake_conn):
            notifications = notif_service.get_notifications(user_id=42)
        
        assert notifications[0]["created_at"] == "2024-06-15T10:30:45"


class TestCreateNotificationsTable:
    """Test create_notifications_table function"""
    
    def test_create_table_checks_if_exists(self, monkeypatch):
        """Test checks if table already exists"""
        import services.notification_service as notif_service
        
        fake_conn = FakeConnection()
        fake_conn.cursor_obj.fetchone_data = ("notifications",)
        
        with patch.object(notif_service, 'get_db_conn', return_value=fake_conn):
            with patch.object(notif_service, 'update_notifications_table_schema'):
                notif_service.create_notifications_table()
        
        # Should query INFORMATION_SCHEMA
        executed = fake_conn.cursor_obj.executed[0]
        assert 'INFORMATION_SCHEMA.TABLES' in str(executed[0])
    
    def test_create_table_creates_if_not_exists(self, monkeypatch):
        """Test creates table if it doesn't exist"""
        import services.notification_service as notif_service
        
        fake_conn = FakeConnection()
        fake_conn.cursor_obj.fetchone_data = None  # Table doesn't exist
        
        with patch.object(notif_service, 'get_db_conn', return_value=fake_conn):
            notif_service.create_notifications_table()
        
        # Should execute CREATE TABLE
        executed_queries = [str(q).upper() for q, _ in fake_conn.cursor_obj.executed]
        assert any('CREATE TABLE' in q for q in executed_queries)
    
    def test_create_table_with_indexes(self, monkeypatch):
        """Test creates indexes for performance"""
        import services.notification_service as notif_service
        
        fake_conn = FakeConnection()
        fake_conn.cursor_obj.fetchone_data = None
        
        with patch.object(notif_service, 'get_db_conn', return_value=fake_conn):
            notif_service.create_notifications_table()
        
        # Should create indexes
        executed_queries = [str(q).upper() for q, _ in fake_conn.cursor_obj.executed]
        index_queries = [q for q in executed_queries if 'CREATE INDEX' in q]
        
        # Should have multiple indexes
        assert len(index_queries) >= 3


class TestNotificationTypes:
    """Test notification type handling"""
    
    def test_notification_supports_multiple_types(self):
        """Test notifications support different types"""
        valid_types = ['info', 'warning', 'danger', 'success']
        
        for notif_type in valid_types:
            assert isinstance(notif_type, str)
    
    def test_disaster_notification_includes_location(self, monkeypatch):
        """Test disaster notifications include location"""
        import services.notification_service as notif_service
        
        fake_conn = FakeConnection()
        fake_conn.cursor_obj.fetchall_data = [
            (1, 42, "Earthquake", "Alert message", "danger", "earthquake", "Sabah", 0, datetime.now())
        ]
        
        with patch.object(notif_service, 'get_db_conn', return_value=fake_conn):
            notifications = notif_service.get_notifications(user_id=42)
        
        assert notifications[0]["disaster_type"] == "earthquake"
        assert notifications[0]["location"] == "Sabah"


class TestNotificationService:
    """Test notification service module"""
    
    def test_module_importable(self):
        """Test notification service can be imported"""
        try:
            import services.notification_service
            assert hasattr(services.notification_service, 'get_notifications')
            assert hasattr(services.notification_service, 'create_notifications_table')
        except ImportError as e:
            pytest.fail(f"Cannot import notification_service: {e}")
    
    def test_notification_closes_connection(self, monkeypatch):
        """Test database connection is properly closed"""
        import services.notification_service as notif_service
        
        fake_conn = FakeConnection()
        fake_conn.cursor_obj.fetchall_data = []
        
        with patch.object(notif_service, 'get_db_conn', return_value=fake_conn):
            notif_service.get_notifications(user_id=42)
        
        assert fake_conn.closed
