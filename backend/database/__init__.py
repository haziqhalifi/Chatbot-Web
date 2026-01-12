# Database package
from .connection import DatabaseConnection, get_connection_pool, get_db_conn, format_timestamp
from .reports import *
from .chat import *
from .users import *
from .admin import *
from .faq import *
from .system_reports import *
from .schema import update_database_schema, migrate_reports_tables

# Export all functions for backwards compatibility
__all__ = [
    # Connection functions
    'DatabaseConnection', 
    'get_connection_pool',
    'get_db_conn',
    'format_timestamp',
    
    # Schema functions
    'update_database_schema',
    'migrate_reports_tables',
    
    # Reports functions
    'insert_report',
    'get_all_reports', 
    'get_report_by_id',
    'update_report_status',
    'update_disaster_reports_table',
    
    # Chat functions
    'create_chat_session',
    'get_user_chat_sessions',
    'get_chat_session', 
    'save_chat_message',
    'get_chat_messages',
    'update_chat_session_title',
    'delete_chat_session',
    'create_chat_tables',
    
    # User functions
    'update_users_table',
    
    # Admin functions
    'get_admin_dashboard_stats',
    'get_system_status',
    
    # FAQ functions
    'create_faq_table',
    'insert_default_faqs',
    'get_all_faqs',
    'get_faq_by_id', 
    'add_faq',
    'update_faq',
    'delete_faq',
    
    # System reports functions
    'insert_system_report',
    'get_all_system_reports'
]
