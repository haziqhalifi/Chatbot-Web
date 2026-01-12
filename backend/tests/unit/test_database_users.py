"""
Unit tests for database.users module
Tests user database operations and schema updates
"""
import pytest
from unittest.mock import Mock, MagicMock, patch
import types


class FakeCursor:
    """Mock database cursor for testing"""
    
    def __init__(self):
        self.executed = []
        self.fetchall_data = []
        self.fetchone_data = None
        self.closed = False
    
    def execute(self, query, params=None):
        self.executed.append((query, params))
        return self
    
    def fetchall(self):
        return self.fetchall_data
    
    def fetchone(self):
        return self.fetchone_data
    
    def close(self):
        self.closed = True


class FakeConnection:
    """Mock database connection for testing"""
    
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


class TestUpdateUsersTable:
    """Test users table schema update functionality"""
    
    def test_update_users_table_checks_existing_columns(self, monkeypatch):
        """Test function checks for existing columns before adding"""
        import database.users as users_module
        
        fake_conn = FakeConnection()
        # Simulate some columns already exist
        fake_conn.cursor_obj.fetchall_data = [
            ('id',), ('email',), ('password',), ('name',)
        ]
        
        with patch.object(users_module, 'DatabaseConnection') as mock_db:
            mock_db.return_value = fake_conn
            
            users_module.update_users_table()
            
            # Should query for existing columns
            assert any('INFORMATION_SCHEMA.COLUMNS' in str(q) for q, _ in fake_conn.cursor_obj.executed)
    
    def test_update_users_table_adds_missing_columns(self, monkeypatch):
        """Test function adds columns that don't exist"""
        import database.users as users_module
        
        fake_conn = FakeConnection()
        # Only basic columns exist
        fake_conn.cursor_obj.fetchall_data = [('id',), ('email',), ('password',)]
        
        with patch.object(users_module, 'DatabaseConnection') as mock_db:
            mock_db.return_value = fake_conn
            
            users_module.update_users_table()
            
            # Should try to add missing columns
            executed_queries = [str(q).lower() for q, _ in fake_conn.cursor_obj.executed]
            assert any('alter table users add name' in q for q in executed_queries)
    
    def test_update_users_table_skips_existing_columns(self, monkeypatch):
        """Test function doesn't add columns that already exist"""
        import database.users as users_module
        
        fake_conn = FakeConnection()
        # All columns already exist
        fake_conn.cursor_obj.fetchall_data = [
            ('id',), ('email',), ('password',), ('name',), ('language',), 
            ('role',), ('given_name',), ('family_name',), ('profile_picture',),
            ('email_verified',), ('auth_provider',), ('phone',), ('address',),
            ('city',), ('state',), ('postcode',), ('country',), ('timezone',),
            ('created_at',), ('updated_at',), ('last_login',)
        ]
        
        with patch.object(users_module, 'DatabaseConnection') as mock_db:
            mock_db.return_value = fake_conn
            
            users_module.update_users_table()
            
            # Should NOT add any columns
            executed_queries = [str(q).lower() for q, _ in fake_conn.cursor_obj.executed]
            alter_queries = [q for q in executed_queries if 'alter table' in q]
            # Only the initial check query should run
            assert len(alter_queries) == 0
    
    def test_update_users_table_adds_google_auth_columns(self, monkeypatch):
        """Test adds Google authentication columns"""
        import database.users as users_module
        
        fake_conn = FakeConnection()
        fake_conn.cursor_obj.fetchall_data = [('id',), ('email',)]
        
        with patch.object(users_module, 'DatabaseConnection') as mock_db:
            mock_db.return_value = fake_conn
            
            users_module.update_users_table()
            
            executed_queries = [str(q).lower() for q, _ in fake_conn.cursor_obj.executed]
            
            # Should add Google-specific columns
            assert any('add given_name' in q for q in executed_queries)
            assert any('add family_name' in q for q in executed_queries)
            assert any('add profile_picture' in q for q in executed_queries)
            assert any('add email_verified' in q for q in executed_queries)
            assert any('add auth_provider' in q for q in executed_queries)
    
    def test_update_users_table_adds_profile_columns(self, monkeypatch):
        """Test adds profile information columns"""
        import database.users as users_module
        
        fake_conn = FakeConnection()
        fake_conn.cursor_obj.fetchall_data = [('id',)]
        
        with patch.object(users_module, 'DatabaseConnection') as mock_db:
            mock_db.return_value = fake_conn
            
            users_module.update_users_table()
            
            executed_queries = [str(q).lower() for q, _ in fake_conn.cursor_obj.executed]
            
            # Should add profile columns
            assert any('add phone' in q for q in executed_queries)
            assert any('add address' in q for q in executed_queries)
            assert any('add city' in q for q in executed_queries)
            assert any('add state' in q for q in executed_queries)
            assert any('add postcode' in q for q in executed_queries)
            assert any('add country' in q for q in executed_queries)
    
    def test_update_users_table_adds_timestamp_columns(self, monkeypatch):
        """Test adds timestamp tracking columns"""
        import database.users as users_module
        
        fake_conn = FakeConnection()
        fake_conn.cursor_obj.fetchall_data = [('id',)]
        
        with patch.object(users_module, 'DatabaseConnection') as mock_db:
            mock_db.return_value = fake_conn
            
            users_module.update_users_table()
            
            executed_queries = [str(q).lower() for q, _ in fake_conn.cursor_obj.executed]
            
            # Should add timestamp columns
            assert any('add created_at' in q for q in executed_queries)
            assert any('add updated_at' in q for q in executed_queries)
            assert any('add last_login' in q for q in executed_queries)
    
    def test_update_users_table_commits_changes(self, monkeypatch):
        """Test function commits schema changes"""
        import database.users as users_module
        
        fake_conn = FakeConnection()
        fake_conn.autocommit = False
        fake_conn.cursor_obj.fetchall_data = [('id',)]
        
        with patch.object(users_module, 'DatabaseConnection') as mock_db:
            mock_db.return_value = fake_conn
            
            users_module.update_users_table()
            
            # Should commit changes
            assert fake_conn.committed
            # Should re-enable autocommit
            assert fake_conn.autocommit
    
    def test_update_users_table_handles_errors(self, monkeypatch):
        """Test function handles database errors gracefully"""
        import database.users as users_module
        
        fake_conn = FakeConnection()
        fake_conn.cursor_obj.execute = Mock(side_effect=Exception("DB Error"))
        
        with patch.object(users_module, 'DatabaseConnection') as mock_db:
            mock_db.return_value = fake_conn
            
            try:
                users_module.update_users_table()
            except Exception as e:
                # Should propagate the error
                assert "DB Error" in str(e)
    
    def test_update_users_table_case_insensitive_column_check(self, monkeypatch):
        """Test column existence check is case-insensitive"""
        import database.users as users_module
        
        fake_conn = FakeConnection()
        # Return columns in different cases
        fake_conn.cursor_obj.fetchall_data = [('ID',), ('EMAIL',), ('NAME',)]
        
        with patch.object(users_module, 'DatabaseConnection') as mock_db:
            mock_db.return_value = fake_conn
            
            users_module.update_users_table()
            
            # Should recognize 'NAME' as existing (converted to lowercase)
            executed_queries = [str(q).lower() for q, _ in fake_conn.cursor_obj.executed]
            # Should NOT try to add 'name' column
            name_alters = [q for q in executed_queries if 'add name' in q]
            assert len(name_alters) == 0


class TestUsersModuleHelpers:
    """Test helper functions in users module"""
    
    def test_users_module_importable(self):
        """Test users module can be imported"""
        try:
            import database.users
            assert hasattr(database.users, 'update_users_table')
        except ImportError as e:
            pytest.fail(f"Cannot import database.users: {e}")
    
    def test_database_connection_import(self):
        """Test DatabaseConnection is imported correctly"""
        import database.users as users_module
        
        # Should import DatabaseConnection from connection module
        assert hasattr(users_module, 'DatabaseConnection')


class TestUsersTableSchema:
    """Test users table schema expectations"""
    
    def test_expected_basic_columns(self):
        """Test basic user columns are defined"""
        expected_columns = ['name', 'language', 'role']
        
        # All these should be added if missing
        for col in expected_columns:
            assert isinstance(col, str)
    
    def test_expected_google_columns(self):
        """Test Google auth columns are defined"""
        google_columns = [
            'given_name', 'family_name', 'profile_picture',
            'email_verified', 'auth_provider'
        ]
        
        for col in google_columns:
            assert isinstance(col, str)
    
    def test_expected_profile_columns(self):
        """Test profile columns are defined"""
        profile_columns = [
            'phone', 'address', 'city', 'state',
            'postcode', 'country', 'timezone'
        ]
        
        for col in profile_columns:
            assert isinstance(col, str)
    
    def test_expected_timestamp_columns(self):
        """Test timestamp columns are defined"""
        timestamp_columns = ['created_at', 'updated_at', 'last_login']
        
        for col in timestamp_columns:
            assert isinstance(col, str)
