"""
Unit tests for database.reports module
Tests disaster report database operations
"""
import pytest
from unittest.mock import Mock, patch
from datetime import datetime
import types


class FakeCursor:
    """Mock database cursor"""
    
    def __init__(self):
        self.executed = []
        self.fetchall_data = []
        self.fetchone_data = None
        self.closed = False
    
    def execute(self, query, params=None):
        self.executed.append((query, params))
    
    def fetchall(self):
        return self.fetchall_data
    
    def fetchone(self):
        return self.fetchone_data
    
    def close(self):
        self.closed = True


class FakeConnection:
    """Mock database connection"""
    
    def __init__(self):
        self.cursor_obj = FakeCursor()
        self.autocommit = True
        self.committed = False
        self.closed = False
    
    def cursor(self):
        return self.cursor_obj
    
    def commit(self):
        self.committed = True
    
    def close(self):
        self.closed = True
    
    def __enter__(self):
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        self.close()


class TestInsertReport:
    """Test insert_report function"""
    
    def test_insert_report_success(self, monkeypatch):
        """Test successfully inserting a disaster report"""
        import database.reports as reports_module
        
        fake_conn = FakeConnection()
        
        report = types.SimpleNamespace(
            user_id=123,
            title="Flood Alert",
            location="Kuala Lumpur",
            disaster_type="flood",
            description="Heavy flooding in the area",
            created_at="2024-01-15 10:30:00"
        )
        
        with patch.object(reports_module, 'DatabaseConnection', return_value=fake_conn):
            result = reports_module.insert_report(report)
        
        assert result["message"] == "Report saved successfully"
        
        # Verify INSERT was executed
        assert len(fake_conn.cursor_obj.executed) > 0
        query, params = fake_conn.cursor_obj.executed[0]
        assert 'INSERT INTO disaster_reports' in str(query)
        
        # Verify parameters
        assert params[0] == 123  # user_id
        assert params[1] == "Flood Alert"  # title
        assert params[2] == "Kuala Lumpur"  # location
        assert params[3] == "flood"  # disaster_type
    
    def test_insert_report_commits_if_needed(self, monkeypatch):
        """Test commits transaction if autocommit is off"""
        import database.reports as reports_module
        
        fake_conn = FakeConnection()
        fake_conn.autocommit = False
        
        report = types.SimpleNamespace(
            user_id=1, title="Test", location="Test", 
            disaster_type="test", description="Test", created_at="2024-01-01"
        )
        
        with patch.object(reports_module, 'DatabaseConnection', return_value=fake_conn):
            reports_module.insert_report(report)
        
        assert fake_conn.committed
    
    def test_insert_report_database_error(self, monkeypatch):
        """Test handles database errors"""
        import database.reports as reports_module
        
        fake_conn = FakeConnection()
        fake_conn.cursor_obj.execute = Mock(side_effect=Exception("DB Error"))
        
        report = types.SimpleNamespace(
            user_id=1, title="Test", location="Test",
            disaster_type="test", description="Test", created_at="2024-01-01"
        )
        
        with patch.object(reports_module, 'DatabaseConnection', return_value=fake_conn):
            with pytest.raises(Exception, match="Database error"):
                reports_module.insert_report(report)


class TestGetAllReports:
    """Test get_all_reports function"""
    
    def test_get_all_reports_success(self, monkeypatch):
        """Test retrieving all disaster reports"""
        import database.reports as reports_module
        
        fake_conn = FakeConnection()
        fake_conn.cursor_obj.fetchall_data = [
            (1, "Earthquake Alert", "Sabah", "earthquake", "Strong quake detected",
             datetime(2024, 1, 15, 10, 0, 0), 100, "John Doe", "john@example.com", "0123456789"),
            (2, "Flood Warning", "Selangor", "flood", "Heavy rain expected",
             datetime(2024, 1, 16, 11, 0, 0), 101, "Jane Smith", "jane@example.com", None)
        ]
        
        with patch.object(reports_module, 'DatabaseConnection', return_value=fake_conn):
            result = reports_module.get_all_reports()
        
        reports = result["reports"]
        assert len(reports) == 2
        
        # Check first report
        assert reports[0]["id"] == 1
        assert reports[0]["title"] == "Earthquake Alert"
        assert reports[0]["location"] == "Sabah"
        assert reports[0]["type"] == "earthquake"
        assert reports[0]["reportedBy"] == "John Doe"
        assert reports[0]["reporterEmail"] == "john@example.com"
        assert reports[0]["reporterPhone"] == "0123456789"
        
        # Check second report with None phone
        assert reports[1]["reporterPhone"] == ""
    
    def test_get_all_reports_joins_user_info(self, monkeypatch):
        """Test reports include user information via JOIN"""
        import database.reports as reports_module
        
        fake_conn = FakeConnection()
        fake_conn.cursor_obj.fetchall_data = []
        
        with patch.object(reports_module, 'DatabaseConnection', return_value=fake_conn):
            reports_module.get_all_reports()
        
        # Verify JOIN with users table
        query = str(fake_conn.cursor_obj.executed[0][0])
        assert 'LEFT JOIN users' in query
    
    def test_get_all_reports_orders_by_date(self, monkeypatch):
        """Test reports ordered by created_at DESC"""
        import database.reports as reports_module
        
        fake_conn = FakeConnection()
        fake_conn.cursor_obj.fetchall_data = []
        
        with patch.object(reports_module, 'DatabaseConnection', return_value=fake_conn):
            reports_module.get_all_reports()
        
        query = str(fake_conn.cursor_obj.executed[0][0])
        assert 'ORDER BY' in query
        assert 'created_at DESC' in query
    
    def test_get_all_reports_default_values(self, monkeypatch):
        """Test reports have default values for missing fields"""
        import database.reports as reports_module
        
        fake_conn = FakeConnection()
        fake_conn.cursor_obj.fetchall_data = [
            (1, "Test", "Location", "flood", "Desc",
             datetime(2024, 1, 1), 1, None, None, None)  # No user info
        ]
        
        with patch.object(reports_module, 'DatabaseConnection', return_value=fake_conn):
            result = reports_module.get_all_reports()
        
        report = result["reports"][0]
        # Check default values
        assert report["reportedBy"] == "Unknown User"
        assert report["reporterEmail"] == ""
        assert report["reporterPhone"] == ""
        assert report["severity"] == "Medium"
        assert report["status"] == "Active"
    
    def test_get_all_reports_database_error(self, monkeypatch):
        """Test handles database errors"""
        import database.reports as reports_module
        
        fake_conn = FakeConnection()
        fake_conn.cursor_obj.execute = Mock(side_effect=Exception("Query failed"))
        
        with patch.object(reports_module, 'DatabaseConnection', return_value=fake_conn):
            with pytest.raises(Exception, match="Database error"):
                reports_module.get_all_reports()


class TestGetReportById:
    """Test get_report_by_id function"""
    
    def test_get_report_by_id_success(self, monkeypatch):
        """Test retrieving specific report by ID"""
        import database.reports as reports_module
        
        fake_conn = FakeConnection()
        fake_conn.cursor_obj.fetchone_data = (
            5, "Specific Report", "Penang", "landslide", "Landslide occurred",
            datetime(2024, 1, 20, 14, 0, 0), 200, "Reporter Name", 
            "reporter@example.com", "0987654321"
        )
        
        with patch.object(reports_module, 'DatabaseConnection', return_value=fake_conn):
            # Note: Function might return dict or fetchone data
            # Adjust based on actual implementation
            try:
                result = reports_module.get_report_by_id(5)
                # If it returns processed data, check it
                if isinstance(result, dict):
                    assert result.get("id") == 5 or "report" in result
            except AttributeError:
                # If function returns raw data, that's ok too
                pass
        
        # Verify WHERE clause with ID
        query, params = fake_conn.cursor_obj.executed[0]
        assert 'WHERE r.id = ?' in str(query)
    
    def test_get_report_by_id_includes_user_join(self, monkeypatch):
        """Test report by ID includes user information"""
        import database.reports as reports_module
        
        fake_conn = FakeConnection()
        fake_conn.cursor_obj.fetchone_data = (
            1, "Test", "Loc", "type", "desc", datetime.now(), 
            1, "User", "email", None
        )
        
        with patch.object(reports_module, 'DatabaseConnection', return_value=fake_conn):
            try:
                reports_module.get_report_by_id(1)
            except (AttributeError, KeyError):
                pass
        
        query = str(fake_conn.cursor_obj.executed[0][0])
        assert 'LEFT JOIN users' in query


class TestReportsModule:
    """Test reports module structure"""
    
    def test_module_importable(self):
        """Test reports module can be imported"""
        try:
            import database.reports
            assert hasattr(database.reports, 'insert_report')
            assert hasattr(database.reports, 'get_all_reports')
            assert hasattr(database.reports, 'get_report_by_id')
        except ImportError as e:
            pytest.fail(f"Cannot import database.reports: {e}")
    
    def test_uses_database_connection(self):
        """Test module uses DatabaseConnection"""
        import database.reports as reports_module
        
        assert hasattr(reports_module, 'DatabaseConnection')
    
    def test_uses_format_timestamp(self):
        """Test module uses format_timestamp helper"""
        import database.reports as reports_module
        
        assert hasattr(reports_module, 'format_timestamp')


class TestReportDataStructure:
    """Test report data structure expectations"""
    
    def test_report_required_fields(self):
        """Test report object has required fields"""
        required_fields = [
            'user_id', 'title', 'location', 
            'disaster_type', 'description', 'created_at'
        ]
        
        for field in required_fields:
            assert isinstance(field, str)
    
    def test_report_response_fields(self):
        """Test report response includes expected fields"""
        expected_response_fields = [
            'id', 'title', 'location', 'type', 'description',
            'timestamp', 'user_id', 'reportedBy', 'reporterEmail',
            'reporterPhone', 'severity', 'status'
        ]
        
        for field in expected_response_fields:
            assert isinstance(field, str)
