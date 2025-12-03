from fastapi import HTTPException, Header, UploadFile, File, Depends
import ollama
import os
import re
import time
from .rag import retrieve_context
from config.models import AI_MODEL, MODEL_SETTINGS
from .language import detect_language, get_language_instruction
from .performance import should_use_rag, perf_monitor, is_general_question
import logging

# Optional whisper import for voice transcription
try:
    import whisper
    WHISPER_AVAILABLE = True
except Exception as e:
    WHISPER_AVAILABLE = False
    print(f"Warning: Whisper not available for audio transcription: {e}")

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
    logger.info(f"RAG enabled by user: {getattr(request, 'rag_enabled', True)}")
    
    # Check if we should use RAG for this query (respects user preference AND internal logic)
    user_wants_rag = getattr(request, 'rag_enabled', True)
    system_recommends_rag = should_use_rag(request.prompt)
    use_rag = user_wants_rag and system_recommends_rag
    
    context = ""
    rag_duration = 0
    
    if use_rag:
        # Retrieve relevant context using RAG
        rag_start = time.time()
        try:
            context = retrieve_context(request.prompt)
            rag_duration = time.time() - rag_start
            logger.info(f"RAG retrieval took {rag_duration:.2f}s, context length: {len(context)} characters")
        except Exception as e:
            rag_duration = time.time() - rag_start
            logger.error(f"Error retrieving context: {str(e)}")
            context = ""
    else:
        if not user_wants_rag:
            logger.info("RAG disabled by user preference")
        elif not system_recommends_rag:
            logger.info("Skipping RAG for general/simple question - performance optimization")
        else:
            logger.info("RAG skipped for unknown reason")
    
    # Log RAG usage
    perf_monitor.log_rag_usage(use_rag, rag_duration if use_rag else None)    
    # Build the enhanced prompt with context
    if context:
        enhanced_prompt = f"""Based on the following relevant information from official documents:

{context}

---

{language_instruction}

Please answer the following question using the provided context when relevant. If the context doesn't contain relevant information, you can provide a general answer:

{request.prompt}"""
    else:
        # Use optimized prompt for general questions
        if is_general_question(request.prompt):
            enhanced_prompt = f"""{language_instruction}

Please provide a helpful and friendly response to: {request.prompt}"""
        else:
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
    
    # Log model performance
    perf_monitor.log_model_time(model_duration)
    
    content = response["message"]["content"]
    # Convert *text* to _text_ (Markdown italics)
    content = re.sub(r'(?<!\*)\*(\w[^*]+\w)\*(?!\*)', r'_\1_', content)
    # Convert **text** to <b>text</b> (HTML bold)
    content = re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', content)
    content = md_table_to_html(content)
    
    total_duration = time.time() - start_time
    logger.info(f"Total request time: {total_duration:.2f}s (RAG: {rag_duration:.2f}s, Model: {model_duration:.2f}s)")
    
    return {"response": content}
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

def transcribe_audio_file(file: UploadFile):
    if not WHISPER_AVAILABLE:
        raise HTTPException(
            status_code=503, 
            detail="Audio transcription is not available. Whisper library is not properly installed."
        )
    
    try:
        audio_bytes = file.file.read()
        temp_dir = os.path.dirname(os.path.abspath(__file__))
        import tempfile
        temp_audio = tempfile.NamedTemporaryFile(delete=False, suffix=".wav", dir=temp_dir)
        try:
            temp_audio.write(audio_bytes)
            temp_audio.flush()
            temp_audio.close()
            model = whisper.load_model("base")
            result = model.transcribe(temp_audio.name)
        finally:
            os.unlink(temp_audio.name)
        return {"transcript": result["text"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
