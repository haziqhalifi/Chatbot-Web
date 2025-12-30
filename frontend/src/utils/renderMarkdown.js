import { marked } from 'marked';
import DOMPurify from 'dompurify';

// Configure marked for chat-friendly output
marked.setOptions({
  gfm: true,
  // In chat, we want paragraph spacing (blank lines) to matter,
  // but we don't want every single newline to become a <br>.
  breaks: false,
});

export default function renderMarkdown(text = '') {
  const normalizedText = String(text)
    // Normalize Windows newlines
    .replace(/\r\n/g, '\n')
    // Collapse excessive blank lines (ChatGPT-style outputs can include many)
    .replace(/\n{3,}/g, '\n\n')
    // Trim trailing whitespace that creates empty visual lines
    .replace(/[ \t]+\n/g, '\n');

  const rawHtml = marked.parse(normalizedText);
  // Sanitize to prevent XSS while allowing standard formatting
  return DOMPurify.sanitize(rawHtml, { USE_PROFILES: { html: true } });
}
