import logging
import re

logger = logging.getLogger(__name__)

def detect_language(text: str) -> str:
    """
    Simple language detection for Malay vs English
    Returns: 'malay', 'english', or 'unknown'
    """
    # Common Malay words/patterns
    malay_indicators = [
        'apa', 'apakah', 'bagaimana', 'mengapa', 'kenapa', 'siapa', 'bila', 'kapan',
        'yang', 'dan', 'atau', 'dengan', 'untuk', 'dalam', 'pada', 'di', 'ke', 'dari',
        'adalah', 'ialah', 'merupakan', 'sebagai', 'boleh', 'dapat', 'akan', 'telah',
        'bencana', 'kerajaan', 'malaysia', 'negara', 'daerah', 'kawasan', 'masyarakat'
    ]
    
    # Common English words/patterns
    english_indicators = [
        'what', 'how', 'why', 'who', 'when', 'where', 'which',
        'and', 'or', 'with', 'for', 'in', 'on', 'to', 'from',
        'is', 'are', 'was', 'were', 'will', 'can', 'could', 'should',
        'disaster', 'government', 'national', 'area', 'community'
    ]
    
    text_lower = text.lower()
    
    malay_count = sum(1 for word in malay_indicators if word in text_lower)
    english_count = sum(1 for word in english_indicators if word in text_lower)
    
    if malay_count > english_count and malay_count > 0:
        return 'malay'
    elif english_count > malay_count and english_count > 0:
        return 'english'
    else:
        return 'unknown'

def get_language_instruction(query_language: str) -> str:
    """Get language-specific instruction for the model"""
    if query_language == 'malay':
        return "PENTING: Sila jawab dalam Bahasa Malaysia. Jangan jawab dalam bahasa Cina atau bahasa lain."
    elif query_language == 'english':
        return "IMPORTANT: Please respond in English. Do NOT respond in Chinese or other languages."
    else:
        return "IMPORTANT: Please respond in the same language as the user's question. If unsure, respond in English."

def some_existing_function():
    # ...existing code...
    pass