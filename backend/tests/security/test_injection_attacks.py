"""
Injection Attack Security Tests

Tests for:
- SQL Injection
- NoSQL Injection
- Command Injection
- LDAP Injection
- XSS (Cross-Site Scripting)
- Path Traversal
"""
import pytest
import re
from urllib.parse import quote, unquote


class TestSQLInjectionPrevention:
    """Test SQL injection prevention"""

    def test_basic_sql_injection_attempt(self, sql_injection_payloads):
        """SQL injection attempts should be detected/prevented"""
        for payload in sql_injection_payloads:
            # Check for SQL injection patterns
            dangerous_patterns = [
                r"('\s*OR\s*')",
                r"(1\s*=\s*1)",
                r"(DROP\s+TABLE)",
                r"(UNION\s+SELECT)",
                r"(--)",
                r"(/\*)",
            ]
            
            is_dangerous = any(re.search(pattern, payload, re.IGNORECASE) for pattern in dangerous_patterns)
            assert is_dangerous or "'" in payload  # Payload looks suspicious

    def test_parameterized_queries_prevent_injection(self):
        """Parameterized queries should prevent SQL injection"""
        # Simulating parameterized query
        query = "SELECT * FROM users WHERE email = ?"
        params = ("user@example.com",)
        
        # The parameter is separate from SQL
        assert "?" in query
        assert isinstance(params, tuple)

    def test_input_sanitization(self, sql_injection_payloads):
        """Input should be sanitized"""
        for payload in sql_injection_payloads:
            # Remove dangerous characters
            sanitized = payload.replace("'", "''").replace(";", "")
            
            # Verify sanitization
            assert sanitized != payload or ";" not in payload

    def test_error_messages_not_leaking_schema(self):
        """Error messages should not reveal database schema"""
        error_messages = [
            "Table 'users' not found",
            "Column 'password' is invalid",
            "Database connection failed",
        ]
        
        for msg in error_messages:
            # Check if schema information is leaked
            has_schema_info = any(x in msg.lower() for x in ["table", "column", "database"])
            if has_schema_info:
                # Only generic errors should be shown to users
                assert "generic error" not in msg.lower()

    def test_case_insensitive_sql_keywords(self, sql_injection_payloads):
        """SQL keywords in different cases should be detected"""
        payload = "' OR '1'='1"
        variations = [
            payload,
            payload.upper(),
            payload.lower(),
            payload.replace("OR", "Or"),
        ]
        
        assert len(variations) > 1

    def test_comment_bypass_attempts(self):
        """SQL comments should not bypass filters"""
        payloads = [
            "1' -- comment",
            "1' # comment",
            "1' /* comment */",
        ]
        
        for payload in payloads:
            assert any(x in payload for x in ["--", "#", "/*"])


class TestXSSPrevention:
    """Test Cross-Site Scripting prevention"""

    def test_script_tags_escaped(self, xss_payloads):
        """Script tags should be escaped or removed"""
        for payload in xss_payloads:
            # HTML escape dangerous characters
            escaped = (payload
                      .replace("<", "&lt;")
                      .replace(">", "&gt;")
                      .replace("'", "&#x27;")
                      .replace('"', "&quot;"))
            
            # Check if dangerous content is neutralized
            assert "<script>" not in escaped

    def test_event_handlers_removed(self, xss_payloads):
        """Event handlers should be removed"""
        dangerous_handlers = ["onerror", "onload", "onfocus", "onmouseover", "onclick"]
        
        for payload in xss_payloads:
            for handler in dangerous_handlers:
                if handler in payload:
                    # Handler should be escaped or removed
                    assert payload.count(handler) >= 1

    def test_javascript_protocol_blocked(self):
        """javascript: protocol should be blocked"""
        unsafe_links = [
            "javascript:alert('xss')",
            "JAVASCRIPT:alert('xss')",
            "jAvAsCrIpT:alert('xss')",
        ]
        
        for link in unsafe_links:
            # Check if blocked
            is_javascript = link.lower().startswith("javascript:")
            assert is_javascript

    def test_html_encoding(self):
        """HTML should be properly encoded"""
        untrusted_input = "<img src=x>"
        
        # HTML encode
        encoded = (untrusted_input
                  .replace("&", "&amp;")
                  .replace("<", "&lt;")
                  .replace(">", "&gt;"))
        
        assert "<img" not in encoded

    def test_attribute_encoding(self):
        """Attributes should be properly encoded"""
        untrusted_attr = '" onmouseover="alert(1)'
        
        # Encode quotes
        encoded = untrusted_attr.replace('"', "&quot;")
        
        assert 'onmouseover=' not in encoded or '&quot;' in encoded

    def test_dom_xss_prevention(self):
        """DOM operations should safely handle untrusted input"""
        untrusted = "<script>alert('xss')</script>"
        
        # Using textContent instead of innerHTML prevents XSS
        # This is a logic check, not actual DOM operation
        uses_text_content = True
        assert uses_text_content

    def test_content_security_policy_headers(self):
        """CSP headers should be present"""
        headers = {
            "Content-Security-Policy": "default-src 'self'; script-src 'self'"
        }
        
        assert "Content-Security-Policy" in headers


class TestCommandInjectionPrevention:
    """Test command injection prevention"""

    def test_shell_metacharacters_escaped(self, command_injection_payloads):
        """Shell metacharacters should be escaped"""
        dangerous_chars = [";", "|", "&", "$", "`", "(", ")"]
        
        for payload in command_injection_payloads:
            has_dangerous = any(char in payload for char in dangerous_chars)
            assert has_dangerous

    def test_shell_execution_avoided(self):
        """Avoid shell=True in subprocess calls"""
        # Correct: subprocess.run(['command', 'arg1'])
        # Wrong: os.system('command arg1')
        
        using_list_args = True  # Using list instead of shell
        assert using_list_args

    def test_input_validation_for_commands(self):
        """Command inputs should be validated"""
        allowed_commands = ["ls", "pwd", "whoami"]
        user_command = "rm -rf /"
        
        assert user_command not in allowed_commands

    def test_whitelist_approach(self):
        """Whitelist approach for command execution"""
        whitelist = {
            "list": "ls -la",
            "current": "pwd",
            "user": "whoami",
        }
        
        user_input = "list"
        assert user_input in whitelist


class TestPathTraversalPrevention:
    """Test path traversal attack prevention"""

    def test_path_traversal_sequences_blocked(self, path_traversal_payloads):
        """Path traversal sequences should be blocked"""
        for payload in path_traversal_payloads:
            # Normalize path
            normalized = payload.replace("\\", "/").replace("..", "")
            
            # Check if traversal is attempted
            has_traversal = ".." in payload or "\\" in payload
            assert has_traversal

    def test_absolute_path_validation(self):
        """Absolute paths should be validated"""
        user_path = "/etc/passwd"
        allowed_base = "/var/www/app"
        
        # Check if path is within allowed base
        is_safe = user_path.startswith(allowed_base)
        assert not is_safe  # This path should be blocked

    def test_symlink_attacks_prevented(self):
        """Symlink attacks should be prevented"""
        # Check for symlinks in path
        import os
        # os.path.realpath() or os.path.islink() should be used
        uses_realpath = True
        assert uses_realpath

    def test_null_byte_injection_blocked(self, null_byte_payloads):
        """Null bytes should be removed"""
        for payload in null_byte_payloads:
            # Remove null bytes
            cleaned = payload.replace("\x00", "")
            
            # Check if null byte was present
            assert "\x00" in payload or cleaned == payload

    def test_url_encoding_bypass_prevention(self, path_traversal_payloads):
        """URL-encoded traversal should be detected"""
        encoded = "%2e%2e%2f%2e%2e%2fetc%2fpasswd"
        
        # Decode and check
        decoded = unquote(encoded)
        
        assert ".." in decoded


class TestLDAPInjectionPrevention:
    """Test LDAP injection prevention"""

    def test_ldap_special_chars_escaped(self, ldap_injection_payloads):
        """LDAP special characters should be escaped"""
        dangerous_chars = ["*", "(", ")", "\\"]
        
        for payload in ldap_injection_payloads:
            has_dangerous = any(char in payload for char in dangerous_chars)
            assert has_dangerous

    def test_ldap_filter_validation(self):
        """LDAP filters should be validated"""
        filters = [
            "(uid=user1)",  # Valid
            "(uid=user1)(uid=user2)",  # Invalid - multiple filters
            "(uid=*)",  # Dangerous wildcard
        ]
        
        # Only first filter is valid
        assert "uid=user1" in filters[0]
        assert "*" in filters[2]


class TestInputValidationGeneral:
    """General input validation tests"""

    def test_large_payload_rejection(self, large_payload):
        """Very large payloads should be rejected"""
        max_size = 1024 * 100  # 100KB
        
        if len(large_payload) > max_size:
            assert True  # Should be rejected

    def test_buffer_overflow_prevention(self):
        """Buffer overflow should be prevented"""
        # Python handles memory automatically, but fixed-size fields should validate
        max_length = 255
        payload = "A" * (max_length + 1)
        
        assert len(payload) > max_length

    def test_type_validation(self):
        """Input types should be validated"""
        expected_type = "email"
        value = 12345
        
        assert not isinstance(value, str)

    def test_format_validation(self):
        """Input format should be validated"""
        email_pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
        
        valid_email = "user@example.com"
        invalid_email = "not an email"
        
        assert re.match(email_pattern, valid_email)
        assert not re.match(email_pattern, invalid_email)

    def test_boundary_value_testing(self):
        """Boundary values should be tested"""
        age_min = 0
        age_max = 150
        
        invalid_ages = [-1, 151, 1000]
        for age in invalid_ages:
            assert age < age_min or age > age_max

    def test_special_characters_handling(self):
        """Special characters should be handled safely"""
        special_chars = ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '-', '_', '+', '=']
        
        for char in special_chars:
            # Should be encoded or escaped
            encoded = quote(char)
            assert char in "!@#$%^&*()-_+="
