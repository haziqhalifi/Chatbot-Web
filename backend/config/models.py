AI_MODEL = "qwen2.5:3b"  # Main model for chat responses

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

# Performance settings retained for model temperature/context only via MODEL_SETTINGS
