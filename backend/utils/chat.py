from fastapi import HTTPException

def verify_api_key(x_api_key: str, API_KEY_CREDITS: dict):
    credits = API_KEY_CREDITS.get(x_api_key, 0)
    if credits <= 0:
        raise HTTPException(status_code=401, detail="Invalid API Key, or no credits")
    return x_api_key
    """
    Transcribe audio file to text with language support.
    
    Args:
        file: Audio file to transcribe
        language: Language code ("ms" for Malay, "en" for English, "auto" for auto-detect)
        method: Transcription method ("openai" for API, "local" for local Whisper, "auto" for best available)
    """
    # Validate file
    if not file:
        raise HTTPException(status_code=400, detail="No audio file provided")
    
    # Check file size (limit to 25MB)
    try:
        audio_bytes = file.file.read()
        file_size_mb = len(audio_bytes) / (1024 * 1024)
        if file_size_mb > 25:
            raise HTTPException(status_code=413, detail="Audio file too large. Maximum size is 25MB.")
    except Exception as e:
        if isinstance(e, HTTPException):
            raise
        raise HTTPException(status_code=400, detail="Failed to read audio file")
    
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
            detail="Voice transcription is currently unavailable. Please try again later."
        )
    
    try:
        if use_openai_api:
            # Use OpenAI Whisper API (better for Malay and multilingual)
            import io
            
            # OpenAI API requires file-like object with name attribute
            audio_file = io.BytesIO(audio_bytes)
            audio_file.name = "audio.wav"
            
            # Set language parameter for OpenAI API
            transcription_params = {"model": "whisper-1", "file": audio_file}
            
            if language and language != "auto":
                transcription_params["language"] = language
            
            logger.info(f"Using OpenAI Whisper API with language: {language}")
            
            try:
                transcript = openai_client.audio.transcriptions.create(**transcription_params)
                
                if not transcript or not transcript.text:
                    raise HTTPException(status_code=400, detail="No speech detected in audio")
                
                return {"transcript": transcript.text, "method": "openai_api"}
            except Exception as api_error:
                logger.error(f"OpenAI API error: {str(api_error)}")
                
                if "insufficient_quota" in str(api_error):
                    raise HTTPException(status_code=503, detail="Transcription quota exceeded. Please try again later.")
                elif "invalid_api_key" in str(api_error):
                    raise HTTPException(status_code=503, detail="Transcription service configuration error.")
                else:
                    raise HTTPException(status_code=500, detail="Transcription failed. Please try again.")
        
        else:
            # Use local Whisper model
            if not WHISPER_AVAILABLE:
                raise HTTPException(
                    status_code=503,
                    detail="Voice transcription is currently unavailable. Please try again later."
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
                
                if not result or not result.get("text"):
                    raise HTTPException(status_code=400, detail="No speech detected in audio")
                
                return {"transcript": result["text"], "method": "local_whisper"}
            finally:
                try:
                    os.unlink(temp_audio.name)
                except:
                    pass
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Transcription error: {str(e)}")
        raise HTTPException(status_code=500, detail="Voice transcription failed. Please try again.")
