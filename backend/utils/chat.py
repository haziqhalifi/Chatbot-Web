from fastapi import HTTPException, Header, UploadFile, File, Depends
import ollama
import os
import re
import time
from config.models import AI_MODEL, MODEL_SETTINGS
from .language import detect_language, get_language_instruction
import logging

# Optional whisper import for voice transcription
try:
    import whisper as openai_whisper
    WHISPER_AVAILABLE = True
except Exception as e:
    WHISPER_AVAILABLE = False
    print(f"Warning: Whisper not available for audio transcription: {e}")

# OpenAI API for better speech recognition (supports Malay and English)
try:
    from openai import OpenAI
    from config.settings import OPENAI_API_KEY
    OPENAI_API_AVAILABLE = bool(OPENAI_API_KEY)
    if OPENAI_API_AVAILABLE:
        openai_client = OpenAI(api_key=OPENAI_API_KEY)
except Exception as e:
    OPENAI_API_AVAILABLE = False
    print(f"Warning: OpenAI API not available for transcription: {e}")

logger = logging.getLogger(__name__)

def verify_api_key(x_api_key: str, API_KEY_CREDITS: dict):
    credits = API_KEY_CREDITS.get(x_api_key, 0)
    if credits <= 0:
        raise HTTPException(status_code=401, detail="Invalid API Key, or no credits")
    return x_api_key

def generate_response(request, x_api_key, API_KEY_CREDITS):
    start_time = time.time()
    API_KEY_CREDITS[x_api_key] -= 1
    
    # Detect query language for better response language control
    query_language = detect_language(request.prompt)
    language_instruction = get_language_instruction(query_language)
    
    logger.info(f"Detected language: {query_language}")
    logger.info(f"Query: {request.prompt[:100]}...")

    # Build a simple prompt without RAG context
    enhanced_prompt = f"""{language_instruction}

Question: {request.prompt}"""

    logger.info(f"Enhanced prompt length: {len(enhanced_prompt)} characters")
    
    # Get model settings
    model_settings = MODEL_SETTINGS.get(AI_MODEL, {"temperature": 0.2})
    
    # Call the model
    model_start = time.time()
    response = ollama.chat(
        model=AI_MODEL,  # Using configurable model from config.py
        messages=[{"role": "user", "content": enhanced_prompt}],
        options={"temperature": model_settings.get("temperature", 0.2)}
    )
    model_duration = time.time() - model_start
    
    content = response["message"]["content"]
    # Convert *text* to _text_ (Markdown italics)
    content = re.sub(r'(?<!\*)\*(\w[^*]+\w)\*(?!\*)', r'_\1_', content)
    # Convert **text** to <b>text</b> (HTML bold)
    content = re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', content)
    content = md_table_to_html(content)
    
    total_duration = time.time() - start_time
    logger.info(f"Total request time: {total_duration:.2f}s (Model: {model_duration:.2f}s)")

    return {"response": content}

def md_table_to_html(md):
    lines = md.strip().split('\n')
    html = []
    i = 0
    while i < len(lines):
        if '|' in lines[i] and i+1 < len(lines) and set(lines[i+1].replace('|','').strip()) <= set('-: '):
            headers = [h.strip() for h in lines[i].split('|')[1:-1]]
            html.append('<table border="1"><thead><tr>' + ''.join(f'<th>{h}</th>' for h in headers) + '</tr></thead><tbody>')
            i += 2
            while i < len(lines) and '|' in lines[i]:
                cells = [c.strip() for c in lines[i].split('|')[1:-1]]
                html.append('<tr>' + ''.join(f'<td>{c}</td>' for c in cells) + '</tr>')
                i += 1
            html.append('</tbody></table>')
        else:
            html.append(lines[i])
            i += 1
    return '\n'.join(html)

def transcribe_audio_file(file: UploadFile, language: str = "auto", method: str = "auto"):
    """
    Transcribe audio file to text with language support.
    
    Args:
        file: Audio file to transcribe
        language: Language code ("ms" for Malay, "en" for English, "auto" for auto-detect)
        method: Transcription method ("openai" for API, "local" for local Whisper, "auto" for best available)
    """
    # Determine which method to use
    use_openai_api = False
    if method == "openai" and OPENAI_API_AVAILABLE:
        use_openai_api = True
    elif method == "auto" and OPENAI_API_AVAILABLE:
        # Prefer OpenAI API as it has better Malay support
        use_openai_api = True
    elif not WHISPER_AVAILABLE and not OPENAI_API_AVAILABLE:
        raise HTTPException(
            status_code=503,
            detail="Audio transcription is not available. Neither OpenAI API nor Whisper library is properly configured."
        )
    
    try:
        audio_bytes = file.file.read()
        
        if use_openai_api:
            # Use OpenAI Whisper API (better for Malay and multilingual)
            import tempfile
            import io
            
            # OpenAI API requires file-like object with name attribute
            audio_file = io.BytesIO(audio_bytes)
            audio_file.name = "audio.wav"
            
            # Set language parameter for OpenAI API
            transcription_params = {"model": "whisper-1", "file": audio_file}
            
            if language and language != "auto":
                transcription_params["language"] = language
            
            logger.info(f"Using OpenAI Whisper API with language: {language}")
            transcript = openai_client.audio.transcriptions.create(**transcription_params)
            return {"transcript": transcript.text, "method": "openai_api"}
        
        else:
            # Use local Whisper model
            if not WHISPER_AVAILABLE:
                raise HTTPException(
                    status_code=503,
                    detail="Local Whisper model is not available. Please configure OpenAI API key or install openai-whisper."
                )
            
            temp_dir = os.path.dirname(os.path.abspath(__file__))
            import tempfile
            temp_audio = tempfile.NamedTemporaryFile(delete=False, suffix=".wav", dir=temp_dir)
            
            try:
                temp_audio.write(audio_bytes)
                temp_audio.flush()
                temp_audio.close()
                
                logger.info(f"Using local Whisper model with language: {language}")
                model = openai_whisper.load_model("base")
                
                # Set language parameter for local Whisper
                transcribe_params = {"audio": temp_audio.name}
                if language and language != "auto":
                    transcribe_params["language"] = language
                
                result = model.transcribe(**transcribe_params)
                return {"transcript": result["text"], "method": "local_whisper"}
            finally:
                os.unlink(temp_audio.name)
    
    except Exception as e:
        logger.error(f"Transcription error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")
