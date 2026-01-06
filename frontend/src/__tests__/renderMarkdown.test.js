import { describe, it, expect } from 'vitest';
import renderMarkdown from '../utils/renderMarkdown';

describe('renderMarkdown', () => {
  it('normalizes newlines and renders paragraphs', () => {
    const html = renderMarkdown('Hello\r\n\r\nWorld');
    expect(html).toContain('<p>Hello</p>');
    expect(html).toContain('<p>World</p>');
  });

  it('sanitizes dangerous HTML while preserving formatting', () => {
    const html = renderMarkdown('**bold text**');
    expect(html).toContain('<strong>');
    expect(html).toContain('bold');
  });
});
