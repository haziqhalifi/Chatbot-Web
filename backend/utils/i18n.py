"""
Internationalization (i18n) utilities for backend multilingual support.
Provides translation capabilities for API responses and messages.
"""

from typing import Dict, Optional
from enum import Enum


class Language(str, Enum):
    """Supported languages"""
    ENGLISH = "en"
    MALAY = "ms"


# Translation dictionary
TRANSLATIONS: Dict[str, Dict[str, str]] = {
    # Authentication messages
    "auth.login_success": {
        "en": "Login successful",
        "ms": "Log masuk berjaya"
    },
    "auth.login_failed": {
        "en": "Login failed. Please check your credentials.",
        "ms": "Log masuk gagal. Sila semak kelayakan anda."
    },
    "auth.invalid_credentials": {
        "en": "Invalid email or password",
        "ms": "Emel atau kata laluan tidak sah"
    },
    "auth.unauthorized": {
        "en": "Unauthorized access",
        "ms": "Akses tidak dibenarkan"
    },
    "auth.token_expired": {
        "en": "Your session has expired. Please login again.",
        "ms": "Sesi anda telah tamat. Sila log masuk semula."
    },
    "auth.registration_success": {
        "en": "Registration successful",
        "ms": "Pendaftaran berjaya"
    },
    "auth.registration_failed": {
        "en": "Registration failed. Please try again.",
        "ms": "Pendaftaran gagal. Sila cuba lagi."
    },
    "auth.email_exists": {
        "en": "Email already registered",
        "ms": "Emel telah didaftarkan"
    },
    
    # Report messages
    "report.submitted": {
        "en": "Disaster report submitted successfully",
        "ms": "Laporan bencana berjaya dihantar"
    },
    "report.submit_failed": {
        "en": "Failed to submit disaster report",
        "ms": "Gagal menghantar laporan bencana"
    },
    "report.updated": {
        "en": "Report updated successfully",
        "ms": "Laporan berjaya dikemas kini"
    },
    "report.deleted": {
        "en": "Report deleted successfully",
        "ms": "Laporan berjaya dipadam"
    },
    "report.not_found": {
        "en": "Report not found",
        "ms": "Laporan tidak dijumpai"
    },
    
    # Notification messages
    "notification.sent": {
        "en": "Notification sent successfully",
        "ms": "Notifikasi berjaya dihantar"
    },
    "notification.marked_read": {
        "en": "Notification marked as read",
        "ms": "Notifikasi ditanda sebagai dibaca"
    },
    "notification.cleared": {
        "en": "All notifications cleared",
        "ms": "Semua notifikasi dikosongkan"
    },
    "notification.flood_warning": {
        "en": "Flood Warning",
        "ms": "Amaran Banjir"
    },
    "notification.landslide_warning": {
        "en": "Landslide Warning",
        "ms": "Amaran Tanah Runtuh"
    },
    "notification.evacuation_notice": {
        "en": "Evacuation Notice",
        "ms": "Notis Pemindahan"
    },
    "notification.weather_update": {
        "en": "Weather Update",
        "ms": "Kemas Kini Cuaca"
    },
    "notification.all_clear": {
        "en": "All Clear",
        "ms": "Semua Selamat"
    },
    
    # Disaster types
    "disaster.flood": {
        "en": "Flood",
        "ms": "Banjir"
    },
    "disaster.landslide": {
        "en": "Landslide",
        "ms": "Tanah Runtuh"
    },
    "disaster.earthquake": {
        "en": "Earthquake",
        "ms": "Gempa Bumi"
    },
    "disaster.fire": {
        "en": "Fire",
        "ms": "Kebakaran"
    },
    "disaster.storm": {
        "en": "Storm",
        "ms": "Ribut"
    },
    "disaster.other": {
        "en": "Other",
        "ms": "Lain-lain"
    },
    
    # Status messages
    "status.pending": {
        "en": "Pending",
        "ms": "Menunggu"
    },
    "status.investigating": {
        "en": "Investigating",
        "ms": "Menyiasat"
    },
    "status.resolved": {
        "en": "Resolved",
        "ms": "Diselesaikan"
    },
    "status.active": {
        "en": "Active",
        "ms": "Aktif"
    },
    "status.inactive": {
        "en": "Inactive",
        "ms": "Tidak Aktif"
    },
    
    # Error messages
    "error.network": {
        "en": "Network error. Please check your connection.",
        "ms": "Ralat rangkaian. Sila semak sambungan anda."
    },
    "error.server": {
        "en": "Server error. Please try again later.",
        "ms": "Ralat pelayan. Sila cuba lagi kemudian."
    },
    "error.validation": {
        "en": "Please fill in all required fields.",
        "ms": "Sila isi semua medan yang diperlukan."
    },
    "error.not_found": {
        "en": "Resource not found",
        "ms": "Sumber tidak dijumpai"
    },
    "error.forbidden": {
        "en": "Access forbidden",
        "ms": "Akses dilarang"
    },
    
    # Success messages
    "success.operation_completed": {
        "en": "Operation completed successfully",
        "ms": "Operasi berjaya diselesaikan"
    },
    "success.data_saved": {
        "en": "Data saved successfully",
        "ms": "Data berjaya disimpan"
    },
    "success.data_updated": {
        "en": "Data updated successfully",
        "ms": "Data berjaya dikemas kini"
    },
    "success.data_deleted": {
        "en": "Data deleted successfully",
        "ms": "Data berjaya dipadam"
    },
    
    # Chat messages
    "chat.greeting": {
        "en": "Hello! How can I help you today?",
        "ms": "Hello! Bagaimana saya boleh membantu anda hari ini?"
    },
    "chat.disaster_info": {
        "en": "I can provide information about disasters, emergency procedures, and safety tips.",
        "ms": "Saya boleh memberikan maklumat tentang bencana, prosedur kecemasan, dan petua keselamatan."
    },
    "chat.report_received": {
        "en": "Thank you for your report. Authorities have been notified.",
        "ms": "Terima kasih atas laporan anda. Pihak berkuasa telah dimaklumkan."
    },
    
    # Profile messages
    "profile.updated": {
        "en": "Profile updated successfully",
        "ms": "Profil berjaya dikemas kini"
    },
    "profile.password_changed": {
        "en": "Password changed successfully",
        "ms": "Kata laluan berjaya ditukar"
    },
    
    # Subscription messages
    "subscription.updated": {
        "en": "Subscription preferences updated successfully",
        "ms": "Keutamaan langganan berjaya dikemas kini"
    },
    "subscription.activated": {
        "en": "Subscription activated",
        "ms": "Langganan diaktifkan"
    },
    "subscription.deactivated": {
        "en": "Subscription deactivated",
        "ms": "Langganan dinyahaktifkan"
    },
}


def translate(key: str, lang: str = "en", **kwargs) -> str:
    """
    Translate a message key to the specified language.
    
    Args:
        key: Translation key (e.g., "auth.login_success")
        lang: Language code ("en" or "ms")
        **kwargs: Optional parameters for string formatting
        
    Returns:
        Translated string
    """
    # Normalize language code
    if lang not in ["en", "ms"]:
        lang = "en"
    
    # Get translation
    if key in TRANSLATIONS:
        message = TRANSLATIONS[key].get(lang, TRANSLATIONS[key]["en"])
    else:
        # Return key if translation not found
        message = key
    
    # Apply formatting if kwargs provided
    if kwargs:
        try:
            message = message.format(**kwargs)
        except KeyError:
            pass  # Return unformatted if keys don't match
    
    return message


def get_language_from_header(accept_language: Optional[str]) -> str:
    """
    Extract language preference from Accept-Language header.
    
    Args:
        accept_language: Accept-Language header value
        
    Returns:
        Language code ("en" or "ms")
    """
    if not accept_language:
        return "en"
    
    # Simple parsing - take first language
    lang = accept_language.split(",")[0].split("-")[0].lower()
    
    # Map to supported languages
    if lang == "ms" or lang == "may" or lang == "malay":
        return "ms"
    else:
        return "en"


class Translator:
    """
    Translator class for easier use in request contexts.
    """
    
    def __init__(self, language: str = "en"):
        """
        Initialize translator with language.
        
        Args:
            language: Language code ("en" or "ms")
        """
        self.language = language if language in ["en", "ms"] else "en"
    
    def t(self, key: str, **kwargs) -> str:
        """
        Translate a key to the instance's language.
        
        Args:
            key: Translation key
            **kwargs: Optional parameters for string formatting
            
        Returns:
            Translated string
        """
        return translate(key, self.language, **kwargs)
    
    def set_language(self, language: str):
        """Set the translator's language."""
        self.language = language if language in ["en", "ms"] else "en"


def create_translator(request_headers: dict) -> Translator:
    """
    Create a translator instance from request headers.
    
    Args:
        request_headers: FastAPI request headers
        
    Returns:
        Translator instance
    """
    accept_language = request_headers.get("accept-language", "en")
    lang = get_language_from_header(accept_language)
    return Translator(lang)
