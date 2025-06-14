# Model Configuration for RAG Chatbot
# This file contains model settings for better maintainability

# Current AI Model Configuration
AI_MODEL = "qwen2.5:3b"  # Main model for chat responses
EMBEDDING_MODEL = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"  # For document embeddings

# Alternative Models (uncomment to use)
# AI_MODEL = "aya:8b"           # Excellent for Malay
# AI_MODEL = "gemma2:9b"        # Good multilingual
# AI_MODEL = "llama3.2:latest"  # General purpose
# AI_MODEL = "tiara:latest"     # Your original model

# Model-specific settings
MODEL_SETTINGS = {
    "qwen2.5:3b": {
        "temperature": 0.3,  # Slightly higher for more natural responses
        "context_length": 4096,
        "supports_malay": True,
        "supports_english": True,
        "language_instruction": "Always respond in the same language as the user's question. Prioritize Malay (Bahasa Malaysia) and English responses."
    },
    "aya:8b": {
        "temperature": 0.3,
        "context_length": 4096,
        "supports_malay": True,
        "supports_english": True
    },
    "tiara:latest": {
        "temperature": 0.2,
        "context_length": 2048,
        "supports_malay": False,
        "supports_english": True
    }
}

# RAG Settings
RAG_SETTINGS = {
    "chunk_size": 500,
    "overlap": 50,
    "max_context_length": 4000,  # Significantly increased to capture more chunks
    "top_k_chunks": 10  # Increased to capture more relevant chunks including the 2020 data
}

# Performance Settings
PERFORMANCE_SETTINGS = {
    "skip_rag_for_general_questions": True,
    "rag_similarity_threshold": 0.3,  # Skip RAG if similarity is too low
    "max_rag_processing_time": 3.0,   # seconds
    "cache_embeddings_model": True
}

# Keywords that indicate general questions (no RAG needed)
GENERAL_QUESTION_KEYWORDS = [
    "hello", "hi", "helo", "hai",
    "what is", "who are you", "how are you",
    "good morning", "good afternoon", "good evening",
    "thank you", "thanks", "terima kasih",
    "apa khabar", "siapa awak", "siapa anda",
    "weather", "time", "date", "joke", "story"
]
