from fastapi import HTTPException, Header, UploadFile, File, Depends
import ollama
import whisper
import os
import re

def verify_api_key(x_api_key: str, API_KEY_CREDITS: dict):
    credits = API_KEY_CREDITS.get(x_api_key, 0)
    if credits <= 0:
        raise HTTPException(status_code=401, detail="Invalid API Key, or no credits")
    return x_api_key

def generate_response(request, x_api_key, API_KEY_CREDITS):
    API_KEY_CREDITS[x_api_key] -= 1
    response = ollama.chat(
        model="tiara",
        messages=[{"role": "user", "content": request.prompt}],
        options={"temperature": 0.2}
    )
    content = response["message"]["content"]
    # Convert *text* to _text_ (Markdown italics)
    content = re.sub(r'(?<!\*)\*(\w[^*]+\w)\*(?!\*)', r'_\1_', content)
    # Convert **text** to <b>text</b> (HTML bold)
    content = re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', content)
    content = md_table_to_html(content)
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
