"""
NADMA Disaster Database Operations
Handles storage and retrieval of disaster data from NADMA MyDIMS API
"""

from .connection import DatabaseConnection
from datetime import datetime
from typing import List, Dict, Optional, Any
import json


def create_nadma_tables():
    """Create NADMA disaster tables if they don't exist"""
    try:
        with DatabaseConnection() as conn:
            conn.autocommit = False
            cursor = conn.cursor()
            
            # Create main disasters table
            cursor.execute("""
                IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'nadma_disasters')
                CREATE TABLE nadma_disasters (
                    id INT PRIMARY KEY,
                    disaster_id INT,
                    district_id INT,
                    state_id INT,
                    kategori_id INT,
                    level_id INT,
                    parish_id INT NULL,
                    created_by_id INT,
                    name NVARCHAR(255) NULL,
                    description NVARCHAR(MAX) NULL,
                    status NVARCHAR(50),
                    bencana_khas NVARCHAR(50),
                    is_backdated BIT,
                    latitude DECIMAL(10, 8),
                    longitude DECIMAL(11, 8),
                    datetime_start DATETIME,
                    datetime_end DATETIME NULL,
                    special_report NVARCHAR(MAX) NULL,
                    created_at DATETIME,
                    updated_at DATETIME,
                    deleted_at DATETIME NULL,
                    last_synced_at DATETIME DEFAULT GETDATE(),
                    raw_data NVARCHAR(MAX) NULL
                )
            """)
            
            # Create disaster categories table
            cursor.execute("""
                IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'nadma_categories')
                CREATE TABLE nadma_categories (
                    id INT PRIMARY KEY,
                    meta_id INT,
                    name NVARCHAR(255),
                    group_helper NVARCHAR(500),
                    created_at DATETIME,
                    updated_at DATETIME
                )
            """)
            
            # Create states table
            cursor.execute("""
                IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'nadma_states')
                CREATE TABLE nadma_states (
                    id INT PRIMARY KEY,
                    name NVARCHAR(255),
                    created_at DATETIME,
                    updated_at DATETIME
                )
            """)
            
            # Create districts table
            cursor.execute("""
                IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'nadma_districts')
                CREATE TABLE nadma_districts (
                    id INT PRIMARY KEY,
                    state_id INT,
                    name NVARCHAR(255),
                    latitude DECIMAL(10, 8),
                    longitude DECIMAL(11, 8),
                    created_at DATETIME,
                    updated_at DATETIME,
                    FOREIGN KEY (state_id) REFERENCES nadma_states(id)
                )
            """)
            
            # Create disaster cases table (PPS, victims, etc.)
            cursor.execute("""
                IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'nadma_disaster_cases')
                CREATE TABLE nadma_disaster_cases (
                    id INT PRIMARY KEY,
                    disaster_id INT,
                    district_id INT,
                    jumlah_pps INT DEFAULT 0,
                    jumlah_keluarga INT DEFAULT 0,
                    jumlah_mangsa INT DEFAULT 0,
                    created_at DATETIME,
                    updated_at DATETIME,
                    FOREIGN KEY (disaster_id) REFERENCES nadma_disasters(id)
                )
            """)
            
            # Create indexes for better performance
            cursor.execute("""
                IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_nadma_disasters_status')
                CREATE INDEX IX_nadma_disasters_status ON nadma_disasters(status)
            """)
            
            cursor.execute("""
                IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_nadma_disasters_datetime_start')
                CREATE INDEX IX_nadma_disasters_datetime_start ON nadma_disasters(datetime_start)
            """)
            
            cursor.execute("""
                IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_nadma_disasters_kategori_id')
                CREATE INDEX IX_nadma_disasters_kategori_id ON nadma_disasters(kategori_id)
            """)
            
            cursor.execute("""
                IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_nadma_disasters_state_id')
                CREATE INDEX IX_nadma_disasters_state_id ON nadma_disasters(state_id)
            """)
            
            conn.commit()
            conn.autocommit = True
            cursor.close()
            print("NADMA disaster tables created successfully")
            return True
            
    except Exception as e:
        print(f"Error creating NADMA tables: {e}")
        return False


def save_disaster(disaster_data: Dict[str, Any]) -> bool:
    """
    Save or update a single disaster record
    
    Args:
        disaster_data: Dictionary containing disaster information from NADMA API
        
    Returns:
        bool: True if successful, False otherwise
    """
    try:
        with DatabaseConnection() as conn:
            cursor = conn.cursor()
            
            # Extract data
            disaster_id = disaster_data.get('id')
            
            # Check if disaster already exists
            cursor.execute("SELECT id FROM nadma_disasters WHERE id = ?", (disaster_id,))
            exists = cursor.fetchone() is not None
            
            if exists:
                # Update existing record
                cursor.execute("""
                    UPDATE nadma_disasters SET
                        disaster_id = ?,
                        district_id = ?,
                        state_id = ?,
                        kategori_id = ?,
                        level_id = ?,
                        parish_id = ?,
                        created_by_id = ?,
                        name = ?,
                        description = ?,
                        status = ?,
                        bencana_khas = ?,
                        is_backdated = ?,
                        latitude = ?,
                        longitude = ?,
                        datetime_start = ?,
                        datetime_end = ?,
                        special_report = ?,
                        updated_at = ?,
                        deleted_at = ?,
                        last_synced_at = GETDATE(),
                        raw_data = ?
                    WHERE id = ?
                """, (
                    disaster_data.get('disaster_id'),
                    disaster_data.get('district_id'),
                    disaster_data.get('state_id'),
                    disaster_data.get('kategori_id'),
                    disaster_data.get('level_id'),
                    disaster_data.get('parish_id'),
                    disaster_data.get('created_by_id'),
                    disaster_data.get('name'),
                    disaster_data.get('description'),
                    disaster_data.get('status'),
                    disaster_data.get('bencana_khas'),
                    disaster_data.get('is_backdated', 0),
                    disaster_data.get('latitude'),
                    disaster_data.get('longitude'),
                    disaster_data.get('datetime_start'),
                    disaster_data.get('datetime_end'),
                    disaster_data.get('special_report'),
                    disaster_data.get('updated_at'),
                    disaster_data.get('deleted_at'),
                    json.dumps(disaster_data, default=str),
                    disaster_id
                ))
            else:
                # Insert new record
                cursor.execute("""
                    INSERT INTO nadma_disasters (
                        id, disaster_id, district_id, state_id, kategori_id, level_id,
                        parish_id, created_by_id, name, description, status, bencana_khas,
                        is_backdated, latitude, longitude, datetime_start, datetime_end,
                        special_report, created_at, updated_at, deleted_at, raw_data
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    disaster_id,
                    disaster_data.get('disaster_id'),
                    disaster_data.get('district_id'),
                    disaster_data.get('state_id'),
                    disaster_data.get('kategori_id'),
                    disaster_data.get('level_id'),
                    disaster_data.get('parish_id'),
                    disaster_data.get('created_by_id'),
                    disaster_data.get('name'),
                    disaster_data.get('description'),
                    disaster_data.get('status'),
                    disaster_data.get('bencana_khas'),
                    disaster_data.get('is_backdated', 0),
                    disaster_data.get('latitude'),
                    disaster_data.get('longitude'),
                    disaster_data.get('datetime_start'),
                    disaster_data.get('datetime_end'),
                    disaster_data.get('special_report'),
                    disaster_data.get('created_at'),
                    disaster_data.get('updated_at'),
                    disaster_data.get('deleted_at'),
                    json.dumps(disaster_data, default=str)
                ))
            
            # Save category if present
            if 'kategori' in disaster_data and disaster_data['kategori']:
                save_category(disaster_data['kategori'], cursor)
            
            # Save state if present
            if 'state' in disaster_data and disaster_data['state']:
                save_state(disaster_data['state'], cursor)
            
            # Save district if present
            if 'district' in disaster_data and disaster_data['district']:
                save_district(disaster_data['district'], cursor)
            
            # Save case information if present
            if 'case' in disaster_data and disaster_data['case']:
                save_disaster_case(disaster_data['case'], disaster_id, cursor)
            
            conn.commit()
            cursor.close()
            return True
            
    except Exception as e:
        print(f"Error saving disaster {disaster_data.get('id')}: {e}")
        return False


def save_category(category_data: Dict[str, Any], cursor) -> None:
    """Save or update disaster category"""
    try:
        category_id = category_data.get('id')
        
        # Check if exists
        cursor.execute("SELECT id FROM nadma_categories WHERE id = ?", (category_id,))
        exists = cursor.fetchone() is not None
        
        if exists:
            cursor.execute("""
                UPDATE nadma_categories SET
                    meta_id = ?, name = ?, group_helper = ?, updated_at = ?
                WHERE id = ?
            """, (
                category_data.get('meta_id'),
                category_data.get('name'),
                category_data.get('group_helper'),
                category_data.get('updated_at'),
                category_id
            ))
        else:
            cursor.execute("""
                INSERT INTO nadma_categories (id, meta_id, name, group_helper, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (
                category_id,
                category_data.get('meta_id'),
                category_data.get('name'),
                category_data.get('group_helper'),
                category_data.get('created_at'),
                category_data.get('updated_at')
            ))
    except Exception as e:
        print(f"Error saving category: {e}")


def save_state(state_data: Dict[str, Any], cursor) -> None:
    """Save or update state"""
    try:
        state_id = state_data.get('id')
        
        cursor.execute("SELECT id FROM nadma_states WHERE id = ?", (state_id,))
        exists = cursor.fetchone() is not None
        
        if exists:
            cursor.execute("""
                UPDATE nadma_states SET name = ?, updated_at = ? WHERE id = ?
            """, (state_data.get('name'), state_data.get('updated_at'), state_id))
        else:
            cursor.execute("""
                INSERT INTO nadma_states (id, name, created_at, updated_at)
                VALUES (?, ?, ?, ?)
            """, (
                state_id,
                state_data.get('name'),
                state_data.get('created_at'),
                state_data.get('updated_at')
            ))
    except Exception as e:
        print(f"Error saving state: {e}")


def save_district(district_data: Dict[str, Any], cursor) -> None:
    """Save or update district"""
    try:
        district_id = district_data.get('id')
        
        cursor.execute("SELECT id FROM nadma_districts WHERE id = ?", (district_id,))
        exists = cursor.fetchone() is not None
        
        if exists:
            cursor.execute("""
                UPDATE nadma_districts SET
                    state_id = ?, name = ?, latitude = ?, longitude = ?, updated_at = ?
                WHERE id = ?
            """, (
                district_data.get('state_id'),
                district_data.get('name'),
                district_data.get('latitude'),
                district_data.get('longitude'),
                district_data.get('updated_at'),
                district_id
            ))
        else:
            cursor.execute("""
                INSERT INTO nadma_districts (id, state_id, name, latitude, longitude, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                district_id,
                district_data.get('state_id'),
                district_data.get('name'),
                district_data.get('latitude'),
                district_data.get('longitude'),
                district_data.get('created_at'),
                district_data.get('updated_at')
            ))
    except Exception as e:
        print(f"Error saving district: {e}")


def save_disaster_case(case_data: Dict[str, Any], disaster_id: int, cursor) -> None:
    """Save or update disaster case information"""
    try:
        case_id = case_data.get('id')
        
        cursor.execute("SELECT id FROM nadma_disaster_cases WHERE id = ?", (case_id,))
        exists = cursor.fetchone() is not None
        
        if exists:
            cursor.execute("""
                UPDATE nadma_disaster_cases SET
                    disaster_id = ?, district_id = ?,
                    jumlah_pps = ?, jumlah_keluarga = ?, jumlah_mangsa = ?,
                    updated_at = ?
                WHERE id = ?
            """, (
                disaster_id,
                case_data.get('district_id'),
                case_data.get('jumlah_pps', 0),
                case_data.get('jumlah_keluarga', 0),
                case_data.get('jumlah_mangsa', 0),
                case_data.get('updated_at'),
                case_id
            ))
        else:
            cursor.execute("""
                INSERT INTO nadma_disaster_cases (
                    id, disaster_id, district_id, jumlah_pps, jumlah_keluarga, jumlah_mangsa,
                    created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                case_id,
                disaster_id,
                case_data.get('district_id'),
                case_data.get('jumlah_pps', 0),
                case_data.get('jumlah_keluarga', 0),
                case_data.get('jumlah_mangsa', 0),
                case_data.get('created_at'),
                case_data.get('updated_at')
            ))
    except Exception as e:
        print(f"Error saving disaster case: {e}")


def save_disasters_batch(disasters_list: List[Dict[str, Any]]) -> Dict[str, int]:
    """
    Save multiple disasters at once
    
    Args:
        disasters_list: List of disaster dictionaries from NADMA API
        
    Returns:
        dict: Statistics about the operation (success, failed, updated counts)
    """
    stats = {'success': 0, 'failed': 0, 'updated': 0, 'new': 0}
    
    for disaster in disasters_list:
        try:
            # Check if exists
            with DatabaseConnection() as conn:
                cursor = conn.cursor()
                cursor.execute("SELECT id FROM nadma_disasters WHERE id = ?", (disaster.get('id'),))
                exists = cursor.fetchone() is not None
                cursor.close()
            
            if save_disaster(disaster):
                stats['success'] += 1
                if exists:
                    stats['updated'] += 1
                else:
                    stats['new'] += 1
            else:
                stats['failed'] += 1
        except Exception as e:
            print(f"Error in batch save for disaster {disaster.get('id')}: {e}")
            stats['failed'] += 1
    
    return stats


def get_all_disasters(status: Optional[str] = None, limit: int = 100) -> List[Dict[str, Any]]:
    """
    Retrieve disasters from database
    
    Args:
        status: Filter by status (Aktif, Selesai, etc.)
        limit: Maximum number of records to return
        
    Returns:
        List of disaster dictionaries
    """
    try:
        with DatabaseConnection() as conn:
            cursor = conn.cursor()
            
            if status:
                cursor.execute("""
                    SELECT TOP (?) * FROM nadma_disasters 
                    WHERE status = ? 
                    ORDER BY datetime_start DESC
                """, (limit, status))
            else:
                cursor.execute("""
                    SELECT TOP (?) * FROM nadma_disasters 
                    ORDER BY datetime_start DESC
                """, (limit,))
            
            columns = [column[0] for column in cursor.description]
            results = []
            
            for row in cursor.fetchall():
                disaster_dict = dict(zip(columns, row))
                results.append(disaster_dict)
            
            cursor.close()
            return results
            
    except Exception as e:
        print(f"Error retrieving disasters: {e}")
        return []


def get_disaster_statistics() -> Dict[str, Any]:
    """Get statistics about stored disasters"""
    try:
        with DatabaseConnection() as conn:
            cursor = conn.cursor()
            
            stats = {}
            
            # Total disasters
            cursor.execute("SELECT COUNT(*) FROM nadma_disasters")
            stats['total'] = cursor.fetchone()[0]
            
            # Active disasters
            cursor.execute("SELECT COUNT(*) FROM nadma_disasters WHERE status = 'Aktif'")
            stats['active'] = cursor.fetchone()[0]
            
            # By category
            cursor.execute("""
                SELECT c.name, COUNT(*) as count
                FROM nadma_disasters d
                JOIN nadma_categories c ON d.kategori_id = c.id
                GROUP BY c.name
            """)
            stats['by_category'] = {row[0]: row[1] for row in cursor.fetchall()}
            
            # By state
            cursor.execute("""
                SELECT s.name, COUNT(*) as count
                FROM nadma_disasters d
                JOIN nadma_states s ON d.state_id = s.id
                GROUP BY s.name
            """)
            stats['by_state'] = {row[0]: row[1] for row in cursor.fetchall()}
            
            # Special cases
            cursor.execute("SELECT COUNT(*) FROM nadma_disasters WHERE bencana_khas = 'Ya'")
            stats['special_cases'] = cursor.fetchone()[0]
            
            cursor.close()
            return stats
            
    except Exception as e:
        print(f"Error getting statistics: {e}")
        return {}


__all__ = [
    'create_nadma_tables',
    'save_disaster',
    'save_disasters_batch',
    'get_all_disasters',
    'get_disaster_statistics',
]
