import os
import pyodbc
from dotenv import load_dotenv

load_dotenv()

SQL_SERVER = os.getenv("SQL_SERVER")
SQL_DATABASE = os.getenv("SQL_DATABASE")
SQL_USER = os.getenv("SQL_USER")
SQL_PASSWORD = os.getenv("SQL_PASSWORD")

conn_str = (
    f"DRIVER={{ODBC Driver 17 for SQL Server}};"
    f"SERVER={SQL_SERVER};"
    f"DATABASE={SQL_DATABASE};"
    f"UID={SQL_USER};"
    f"PWD={SQL_PASSWORD}"
)

def get_db_conn():
    return pyodbc.connect(conn_str)

def insert_report(report):
    try:
        conn = get_db_conn()
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO reports (user_id, title, location, disaster_type, description, timestamp)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                report.user_id,
                report.title,
                report.location,
                report.disaster_type,
                report.description,
                report.timestamp
            )
        )
        conn.commit()
        return {"message": "Report saved successfully"}
    except Exception as e:
        raise Exception(f"Database error: {e}")
    finally:
        try:
            conn.close()
        except:
            pass
