from .connection import DatabaseConnection, format_timestamp

def create_faq_table():
    """Create the FAQ table if it doesn't exist"""
    try:
        with DatabaseConnection() as conn:
            # Temporarily disable autocommit for schema changes
            conn.autocommit = False
            cursor = conn.cursor()
            cursor.execute("""
                IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='faqs' AND xtype='U')
                CREATE TABLE faqs (
                    id INT IDENTITY(1,1) PRIMARY KEY,
                    question NVARCHAR(500) NOT NULL,
                    answer NVARCHAR(MAX) NOT NULL,
                    category NVARCHAR(100),
                    order_index INT DEFAULT 0,
                    is_active BIT DEFAULT 1,
                    created_by INT NULL,
                    updated_by INT NULL,
                    created_at DATETIME DEFAULT GETDATE(),
                    updated_at DATETIME DEFAULT GETDATE(),
                    FOREIGN KEY (created_by) REFERENCES users(id),
                    FOREIGN KEY (updated_by) REFERENCES users(id)
                )
            """)
            
            # Add columns if table exists but columns don't
            cursor.execute("""
                IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
                              WHERE TABLE_NAME = 'faqs' AND COLUMN_NAME = 'created_by')
                BEGIN
                    ALTER TABLE faqs ADD created_by INT NULL
                    ALTER TABLE faqs ADD CONSTRAINT FK_faqs_created_by FOREIGN KEY (created_by) REFERENCES users(id)
                END
            """)
            
            cursor.execute("""
                IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
                              WHERE TABLE_NAME = 'faqs' AND COLUMN_NAME = 'updated_by')
                BEGIN
                    ALTER TABLE faqs ADD updated_by INT NULL
                    ALTER TABLE faqs ADD CONSTRAINT FK_faqs_updated_by FOREIGN KEY (updated_by) REFERENCES users(id)
                END
            """)
            
            conn.commit()
            conn.autocommit = True
            cursor.close()
    except Exception as e:
        print(f"Error creating FAQ table: {e}")

def insert_default_faqs():
    """Insert default FAQ data"""
    try:
        with DatabaseConnection() as conn:
            # Temporarily disable autocommit for bulk inserts
            conn.autocommit = False
            cursor = conn.cursor()
            
            # Check if FAQs already exist
            cursor.execute("SELECT COUNT(*) FROM faqs")
            count = cursor.fetchone()[0]
            
            if count == 0:
                default_faqs = [
                    ("How do I reset my password?", "Go to the account page and click on 'Change Password'.", "Account", 1),
                    ("How do I contact support?", "Use the 'Contact us' button at the bottom of the sign up page or email support@disasterwatch.com.", "Support", 2),
                    ("Is my data secure?", "Yes, we use industry-standard security practices to protect your data.", "Security", 3),
                    ("What can I ask the chatbot?", "You can ask about disaster-related information such as:\n• 'What areas are at risk of flooding?'\n• 'Is there any landslide reported near Rawang?'\n• 'What should I do during a flash flood?'\n• 'Show me the emergency SOP for earthquakes.'", "Chatbot", 4),
                    ("Can I use voice to interact with the chatbot?", "Yes! Click the microphone icon to ask your question using your voice. Make sure to allow microphone access in your browser.", "Chatbot", 5),
                    ("Which languages does the chatbot support?", "Currently, the chatbot supports English and Bahasa Melayu. You can switch your preferred language in the account settings.", "Language", 6),
                    ("How accurate is the disaster information?", "The system uses data from verified sources like Pusat Geospatial Negara (PGN) and official disaster dashboards. However, always follow announcements from NADMA or local authorities during emergencies.", "Data", 7),
                    ("Can I report a disaster incident?", "Yes. Go to the 'Report Incident' section, describe the event, and optionally upload a photo. Your report will be reviewed by relevant agencies.", "Reporting", 8),
                    ("I can't see the map. What should I do?", "Try the following:\n• Refresh the page\n• Ensure your browser supports JavaScript\n• Allow location access if required\n• Use a modern browser like Chrome or Edge", "Troubleshooting", 9),
                    ("Who can use this chatbot?", "Both public users and government officers can use the system. Government officers may have access to additional datasets or dashboard insights based on their roles.", "Access", 10),
                    ("How do I change my language or voice settings?", "Go to My Account > Preferences, and select your default input and language preferences.", "Settings", 11),
                    ("Where can I get emergency contact numbers?", "Click the 'Emergency Contacts' tab to view phone numbers by disaster type and region.", "Emergency", 12)
                ]
                
                for question, answer, category, order_index in default_faqs:
                    cursor.execute("""
                        INSERT INTO faqs (question, answer, category, order_index, is_active)
                        VALUES (?, ?, ?, ?, 1)
                    """, (question, answer, category, order_index))
                
                conn.commit()
                print("Default FAQs inserted successfully")
            
            conn.autocommit = True
            cursor.close()
        
    except Exception as e:
        print(f"Error inserting default FAQs: {e}")

def get_all_faqs():
    """Get all active FAQs ordered by order_index"""
    try:
        with DatabaseConnection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT f.id, f.question, f.answer, f.category, f.order_index, 
                       f.created_at, f.updated_at, f.created_by, f.updated_by,
                       u1.name as created_by_name, u1.email as created_by_email,
                       u2.name as updated_by_name, u2.email as updated_by_email
                FROM faqs f
                LEFT JOIN users u1 ON f.created_by = u1.id
                LEFT JOIN users u2 ON f.updated_by = u2.id
                WHERE f.is_active = 1
                ORDER BY f.order_index ASC, f.created_at ASC
            """)
            
            faqs = []
            for row in cursor.fetchall():
                faqs.append({
                    'id': row[0],
                    'question': row[1],
                    'answer': row[2],
                    'category': row[3],
                    'order_index': row[4],
                    'created_at': format_timestamp(row[5]),
                    'updated_at': format_timestamp(row[6]),
                    'created_by': row[7],
                    'created_by_name': row[9],
                    'created_by_email': row[10],
                    'updated_by': row[8],
                    'updated_by_name': row[11],
                    'updated_by_email': row[12]
                })
            
            cursor.close()
            return faqs
    except Exception as e:
        print(f"Error getting FAQs: {e}")
        return []

def get_faq_by_id(faq_id):
    """Get a specific FAQ by ID"""
    try:
        with DatabaseConnection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT f.id, f.question, f.answer, f.category, f.order_index, 
                       f.created_at, f.updated_at, f.created_by, f.updated_by,
                       u1.name as created_by_name, u1.email as created_by_email,
                       u2.name as updated_by_name, u2.email as updated_by_email
                FROM faqs f
                LEFT JOIN users u1 ON f.created_by = u1.id
                LEFT JOIN users u2 ON f.updated_by = u2.id
                WHERE f.id = ? AND f.is_active = 1
            """, (faq_id,))
            
            row = cursor.fetchone()
            cursor.close()
            
            if row:
                return {
                    'id': row[0],
                    'question': row[1],
                    'answer': row[2],
                    'category': row[3],
                    'order_index': row[4],
                    'created_at': format_timestamp(row[5]),
                    'updated_at': format_timestamp(row[6]),
                    'created_by': row[7],
                    'created_by_name': row[9],
                    'created_by_email': row[10],
                    'updated_by': row[8],
                    'updated_by_name': row[11],
                    'updated_by_email': row[12]
                }
            return None
    except Exception as e:
        print(f"Error getting FAQ by ID: {e}")
        return None

def add_faq(question, answer, category=None, order_index=0, created_by=None):
    """Add a new FAQ
    
    Args:
        question: FAQ question text
        answer: FAQ answer text
        category: Optional category for grouping
        order_index: Display order (default 0)
        created_by: User ID of admin who created this FAQ
    """
    try:
        with DatabaseConnection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO faqs (question, answer, category, order_index, is_active, created_by, updated_by)
                OUTPUT INSERTED.id
                VALUES (?, ?, ?, ?, 1, ?, ?)
            """, (question, answer, category, order_index, created_by, created_by))
            result = cursor.fetchone()
            if not conn.autocommit:
                conn.commit()
            faq_id = int(result[0]) if result else None
            cursor.close()
            return faq_id
    except Exception as e:
        print(f"Error adding FAQ: {e}")
        import traceback
        traceback.print_exc()
        return None

def update_faq(faq_id, question=None, answer=None, category=None, order_index=None, updated_by=None):
    """Update an existing FAQ
    
    Args:
        faq_id: ID of FAQ to update
        question: Optional new question text
        answer: Optional new answer text
        category: Optional new category
        order_index: Optional new order index
        updated_by: User ID of admin who updated this FAQ
    """
    try:
        with DatabaseConnection() as conn:
            cursor = conn.cursor()
            
            updates = []
            params = []
            
            if question is not None:
                updates.append("question = ?")
                params.append(question)
            if answer is not None:
                updates.append("answer = ?")
                params.append(answer)
            if category is not None:
                updates.append("category = ?")
                params.append(category)
            if order_index is not None:
                updates.append("order_index = ?")
                params.append(order_index)
            
            if updates:
                updates.append("updated_at = GETDATE()")
                if updated_by is not None:
                    updates.append("updated_by = ?")
                    params.append(updated_by)
                params.append(faq_id)
                
                query = f"UPDATE faqs SET {', '.join(updates)} WHERE id = ?"
                cursor.execute(query, params)
                if not conn.autocommit:
                    conn.commit()
                result = cursor.rowcount > 0
                cursor.close()
                return result
            
            cursor.close()
            return False
    except Exception as e:
        print(f"Error updating FAQ: {e}")
        return False

def delete_faq(faq_id, deleted_by=None):
    """Soft delete an FAQ by setting is_active to 0
    
    Args:
        faq_id: ID of FAQ to delete
        deleted_by: User ID of admin who deleted this FAQ
    """
    try:
        with DatabaseConnection() as conn:
            cursor = conn.cursor()
            if deleted_by is not None:
                cursor.execute(
                    "UPDATE faqs SET is_active = 0, updated_at = GETDATE(), updated_by = ? WHERE id = ?", 
                    (deleted_by, faq_id)
                )
            else:
                cursor.execute(
                    "UPDATE faqs SET is_active = 0, updated_at = GETDATE() WHERE id = ?", 
                    (faq_id,)
                )
            if not conn.autocommit:
                conn.commit()
            result = cursor.rowcount > 0
            cursor.close()
            return result
    except Exception as e:
        print(f"Error deleting FAQ: {e}")
        return False

__all__ = [
    'create_faq_table',
    'insert_default_faqs',
    'get_all_faqs',
    'get_faq_by_id',
    'add_faq',
    'update_faq',
    'delete_faq'
]
