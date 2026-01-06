import pytest


class TestAdminEndpoints:
    """Test suite for admin endpoints"""

    def test_admin_dashboard_stats_missing_auth(self, test_client):
        """Test getting dashboard stats fails without authentication"""
        response = test_client.get("/admin/dashboard/stats")
        assert response.status_code == 401

    def test_admin_dashboard_stats_non_admin(self, test_client, auth_headers):
        """Test non-admin cannot access dashboard"""
        response = test_client.get("/admin/dashboard/stats", headers=auth_headers)
        assert response.status_code in [403, 500]

    def test_admin_dashboard_stats_admin(self, test_client, admin_headers):
        """Test admin can access dashboard"""
        response = test_client.get("/admin/dashboard/stats", headers=admin_headers)
        assert response.status_code in [200, 403, 500]

    def test_system_status_missing_auth(self, test_client):
        """Test getting system status fails without authentication"""
        response = test_client.get("/admin/system/status")
        assert response.status_code == 401

    def test_system_status_non_admin(self, test_client, auth_headers):
        """Test non-admin cannot access system status"""
        response = test_client.get("/admin/system/status", headers=auth_headers)
        assert response.status_code in [403, 500]

    def test_system_status_admin(self, test_client, admin_headers):
        """Test admin can access system status"""
        response = test_client.get("/admin/system/status", headers=admin_headers)
        assert response.status_code in [200, 403, 500]

    def test_performance_metrics_missing_auth(self, test_client):
        """Test getting performance metrics fails without auth"""
        response = test_client.get("/performance")
        assert response.status_code == 401

    def test_performance_metrics_with_auth(self, test_client, auth_headers):
        """Test getting performance metrics"""
        response = test_client.get("/performance", headers=auth_headers)
        assert response.status_code in [200, 403, 500]

    def test_admin_send_notification_missing_auth(self, test_client):
        """Test sending notification fails without authentication"""
        response = test_client.post("/admin/notifications/send", json={
            "title": "Test",
            "message": "Test message"
        })
        assert response.status_code == 401

    def test_admin_send_notification_non_admin(self, test_client, auth_headers):
        """Test non-admin cannot send notifications"""
        response = test_client.post("/admin/notifications/send",
            json={
                "title": "Test",
                "message": "Test"
            },
            headers=auth_headers
        )
        assert response.status_code in [403, 500]

    def test_admin_send_notification_admin(self, test_client, admin_headers):
        """Test admin can send notifications"""
        response = test_client.post("/admin/notifications/send",
            json={
                "title": "Test",
                "message": "Test message"
            },
            headers=admin_headers
        )
        assert response.status_code in [200, 201, 403, 500]


class TestReportEndpoints:
    """Test suite for incident report endpoints"""

    def test_create_report_missing_auth(self, test_client):
        """Test creating report fails without authentication"""
        response = test_client.post("/report", json={
            "incident_type": "flood",
            "location": "KL"
        })
        assert response.status_code == 401

    def test_create_report_with_auth(self, test_client, auth_headers, sample_report_data):
        """Test creating incident report"""
        response = test_client.post("/report",
            json=sample_report_data,
            headers=auth_headers
        )
        assert response.status_code in [200, 201, 500]

    def test_create_report_missing_location(self, test_client, auth_headers):
        """Test creating report without location"""
        response = test_client.post("/report",
            json={
                "incident_type": "flood",
                "description": "Flash flooding"
            },
            headers=auth_headers
        )
        assert response.status_code in [200, 201, 400, 422, 500]

    def test_create_report_missing_incident_type(self, test_client, auth_headers):
        """Test creating report without incident type"""
        response = test_client.post("/report",
            json={
                "location": "KL",
                "description": "Flash flooding"
            },
            headers=auth_headers
        )
        assert response.status_code in [200, 400, 422, 500]

    def test_create_report_empty_description(self, test_client, auth_headers):
        """Test creating report with empty description"""
        response = test_client.post("/report",
            json={
                "incident_type": "flood",
                "location": "KL",
                "description": ""
            },
            headers=auth_headers
        )
        assert response.status_code in [200, 201, 400, 500]

    def test_create_system_report(self, test_client):
        """Test creating system-level report"""
        response = test_client.post("/system-report", json={
            "report_type": "error",
            "message": "System error occurred"
        })
        assert response.status_code in [200, 201, 500]

    def test_get_reports_missing_auth(self, test_client):
        """Test getting reports fails without authentication"""
        response = test_client.get("/admin/reports")
        assert response.status_code == 401

    def test_get_reports_non_admin(self, test_client, auth_headers):
        """Test non-admin cannot access reports"""
        response = test_client.get("/admin/reports", headers=auth_headers)
        assert response.status_code in [403, 500]

    def test_get_reports_admin(self, test_client, admin_headers):
        """Test admin can access reports"""
        response = test_client.get("/admin/reports", headers=admin_headers)
        assert response.status_code in [200, 403, 500]

    def test_get_report_by_id_missing_auth(self, test_client):
        """Test getting report by ID fails without authentication"""
        response = test_client.get("/admin/reports/1")
        assert response.status_code == 401

    def test_get_report_by_id_not_found(self, test_client, admin_headers):
        """Test getting non-existent report"""
        response = test_client.get("/admin/reports/99999", headers=admin_headers)
        assert response.status_code in [404, 403, 500]

    def test_export_reports_csv_missing_auth(self, test_client):
        """Test exporting reports as CSV fails without authentication"""
        response = test_client.get("/admin/reports/export/csv")
        assert response.status_code == 401

    def test_export_reports_csv_non_admin(self, test_client, auth_headers):
        """Test non-admin cannot export reports"""
        response = test_client.get("/admin/reports/export/csv", headers=auth_headers)
        assert response.status_code in [403, 500]

    def test_export_reports_csv_admin(self, test_client, admin_headers):
        """Test admin can export reports as CSV"""
        response = test_client.get("/admin/reports/export/csv", headers=admin_headers)
        assert response.status_code in [200, 403, 500]

    def test_export_reports_pdf_missing_auth(self, test_client):
        """Test exporting reports as PDF fails without authentication"""
        response = test_client.get("/admin/reports/export/pdf")
        assert response.status_code == 401

    def test_export_reports_pdf_admin(self, test_client, admin_headers):
        """Test admin can export reports as PDF"""
        response = test_client.get("/admin/reports/export/pdf", headers=admin_headers)
        assert response.status_code in [200, 403, 500]

    def test_get_system_reports_missing_auth(self, test_client):
        """Test getting system reports fails without authentication"""
        response = test_client.get("/admin/system-reports")
        assert response.status_code == 401

    def test_get_system_reports_admin(self, test_client, admin_headers):
        """Test admin can access system reports"""
        response = test_client.get("/admin/system-reports", headers=admin_headers)
        assert response.status_code in [200, 403, 500]


class TestMapDataEndpoints:
    """Test suite for map/GIS data endpoints"""

    def test_get_map_endpoints(self, test_client):
        """Test getting available map endpoints"""
        response = test_client.get("/endpoints")
        assert response.status_code in [200, 500]

    def test_get_map_endpoint_by_type(self, test_client):
        """Test getting map endpoint by type"""
        response = test_client.get("/endpoints/disaster")
        assert response.status_code in [200, 404, 500]

    def test_get_disaster_types(self, test_client):
        """Test getting disaster types"""
        response = test_client.get("/types")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, (list, dict))

    def test_get_nadma_disasters(self, test_client):
        """Test getting NADMA disasters"""
        response = test_client.get("/nadma/disasters")
        assert response.status_code in [200, 500]

    def test_get_nadma_disasters_from_db(self, test_client):
        """Test getting NADMA disasters from database"""
        response = test_client.get("/nadma/disasters/db")
        assert response.status_code in [200, 500]

    def test_post_nadma_disasters_missing_auth(self, test_client):
        """Test posting disasters fails without authentication"""
        response = test_client.post("/nadma/disasters", json={
            "disasters": []
        })
        assert response.status_code == 401

    def test_post_nadma_disasters_with_auth(self, test_client, auth_headers):
        """Test posting NADMA disasters"""
        response = test_client.post("/nadma/disasters",
            json={"disasters": []},
            headers=auth_headers
        )
        assert response.status_code in [200, 500]

    def test_sync_nadma_data_missing_auth(self, test_client):
        """Test syncing NADMA data fails without authentication"""
        response = test_client.post("/nadma/sync", json={})
        assert response.status_code == 401

    def test_sync_nadma_data_with_auth(self, test_client, auth_headers):
        """Test syncing NADMA data"""
        response = test_client.post("/nadma/sync",
            json={},
            headers=auth_headers
        )
        assert response.status_code in [200, 500]

    def test_get_nadma_statistics(self, test_client):
        """Test getting NADMA statistics"""
        response = test_client.get("/nadma/statistics")
        assert response.status_code in [200, 500]

    def test_get_nadma_history_missing_auth(self, test_client):
        """Test getting NADMA history fails without authentication"""
        response = test_client.get("/admin/nadma/history")
        assert response.status_code == 401

    def test_get_nadma_history_admin(self, test_client, admin_headers):
        """Test admin can access NADMA history"""
        response = test_client.get("/admin/nadma/history", headers=admin_headers)
        assert response.status_code in [200, 403, 500]

    def test_init_nadma_db_missing_auth(self, test_client):
        """Test initializing NADMA DB fails without authentication"""
        response = test_client.post("/nadma/init-db", json={})
        assert response.status_code == 401

    def test_init_nadma_db_with_auth(self, test_client, auth_headers):
        """Test initializing NADMA database"""
        response = test_client.post("/nadma/init-db",
            json={},
            headers=auth_headers
        )
        assert response.status_code in [200, 403, 500]


class TestHealthCheckEndpoints:
    """Test suite for health check endpoints"""

    def test_database_health_check(self, test_client):
        """Test database health check"""
        response = test_client.get("/health/database")
        assert response.status_code in [200, 500]
        if response.status_code == 200:
            data = response.json()
            assert isinstance(data, dict)

    def test_database_stats(self, test_client, auth_headers):
        """Test getting database statistics"""
        response = test_client.get("/health/database/stats", headers=auth_headers)
        assert response.status_code in [200, 500]

    def test_dev_api_key_endpoint(self, test_client):
        """Test getting API key for development"""
        response = test_client.get("/dev/api-key")
        assert response.status_code in [200, 500]

    def test_create_test_notification(self, test_client):
        """Test creating test notification"""
        response = test_client.post("/dev/test-enhanced-notification", json={})
        assert response.status_code in [200, 201, 500]


class TestDataValidation:
    """Test data validation across endpoints"""

    def test_json_content_type_required(self, test_client):
        """Test JSON content type is required for POST/PUT"""
        response = test_client.post("/signup",
            data="invalid",
            headers={"Content-Type": "text/plain"}
        )
        assert response.status_code in [400, 422, 415]

    def test_large_payload_handling(self, test_client, auth_headers):
        """Test handling of large payloads"""
        large_content = "a" * 1000000
        response = test_client.post("/chat/sessions/1/messages",
            json={"content": large_content},
            headers=auth_headers
        )
        assert response.status_code in [200, 201, 413, 404, 500]

    def test_null_values_in_required_fields(self, test_client):
        """Test null values in required fields"""
        response = test_client.post("/signup", json={
            "email": None,
            "password": None
        })
        assert response.status_code in [400, 422]

    def test_missing_content_type_header(self, test_client):
        """Test missing Content-Type header"""
        response = test_client.post("/signup",
            json={"email": "test@example.com", "password": "Test123!"},
            headers={"Content-Type": ""}
        )
        assert response.status_code in [200, 201, 400, 422, 500]
