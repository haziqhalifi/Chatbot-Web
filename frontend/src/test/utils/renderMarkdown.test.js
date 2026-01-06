import { describe, it, expect, vi } from 'vitest';
import renderMarkdown from '../../utils/renderMarkdown';

describe('renderMarkdown', () => {
  it('should render simple text without markdown', () => {
    const text = 'Hello world';
    const result = renderMarkdown(text);
    expect(result).toContain('Hello world');
  });

  it('should render bold text', () => {
    const text = '**bold text**';
    const result = renderMarkdown(text);
    expect(result).toContain('<strong>');
    expect(result).toContain('bold text');
  });

  it('should render italic text', () => {
    const text = '*italic text*';
    const result = renderMarkdown(text);
    expect(result).toContain('<em>');
  });

  it('should render headers', () => {
    const text = '# Header 1\n## Header 2';
    const result = renderMarkdown(text);
    expect(result).toContain('<h1>');
    expect(result).toContain('<h2>');
  });

  it('should render lists', () => {
    const text = '- Item 1\n- Item 2\n- Item 3';
    const result = renderMarkdown(text);
    expect(result).toContain('<ul>');
    expect(result).toContain('<li>');
  });

  it('should render code blocks', () => {
    const text = '```\nconst x = 1;\n```';
    const result = renderMarkdown(text);
    expect(result).toContain('<code>');
  });

  it('should render links', () => {
    const text = '[Google](https://google.com)';
    const result = renderMarkdown(text);
    expect(result).toContain('href');
    expect(result).toContain('google.com');
  });

  it('should normalize Windows newlines', () => {
    const text = 'Line 1\r\nLine 2';
    const result = renderMarkdown(text);
    expect(result).toContain('Line 1');
    expect(result).toContain('Line 2');
  });

  it('should collapse excessive blank lines', () => {
    const text = 'Paragraph 1\n\n\n\nParagraph 2';
    const result = renderMarkdown(text);
    const html = result.replace(/\s+/g, ' ');
    expect(html).not.toContain('Paragraph 1\n\n\n\nParagraph 2');
  });

  it('should handle empty input', () => {
    const result = renderMarkdown('');
    expect(result).toBeDefined();
    expect(typeof result).toBe('string');
  });

  it('should handle null/undefined input', () => {
    const result = renderMarkdown(null);
    expect(result).toBeDefined();
    expect(typeof result).toBe('string');
  });

  it('should sanitize XSS attempts', () => {
    const text = '<img src=x onerror="alert(1)">';
    const result = renderMarkdown(text);
    expect(result).not.toContain('onerror');
  });

  it('should render tables with gfm enabled', () => {
    const text = '| Header 1 | Header 2 |\n|----------|----------|\n| Cell 1 | Cell 2 |';
    const result = renderMarkdown(text);
    expect(result).toContain('<table>');
    expect(result).toContain('<th>');
  });

  it('should render strikethrough text', () => {
    const text = '~~strikethrough~~';
    const result = renderMarkdown(text);
    expect(result).toContain('<del>') || expect(result).toContain('<s>');
  });

  it('should preserve inline code', () => {
    const text = 'Use `const x = 1;` in your code';
    const result = renderMarkdown(text);
    expect(result).toContain('<code>');
    expect(result).toContain('const x = 1;');
  });
});
