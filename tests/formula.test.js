import { describe, it, expect } from 'vitest';
import { renderFormula } from '../web/lib.js';

describe('renderFormula', () => {
  it('returns empty string for null', () => {
    expect(renderFormula(null)).toBe('');
  });

  it('returns empty string for empty array', () => {
    expect(renderFormula([])).toBe('');
  });

  it('wraps output in formula-row div', () => {
    const html = renderFormula([{k:'op', v:'→'}]);
    expect(html).toMatch(/^<div class="formula-row">/);
    expect(html).toMatch(/<\/div>$/);
  });

  it('renders op token as formula-op span', () => {
    const html = renderFormula([{k:'op', v:'+'}]);
    expect(html).toContain('class="formula-op"');
    expect(html).toContain('+');
  });

  it('renders fn token as formula-fn span', () => {
    const html = renderFormula([{k:'fn', v:'SHA-256'}]);
    expect(html).toContain('class="formula-fn"');
    expect(html).toContain('SHA-256');
  });

  it('renders typed block with correct class, label, and value', () => {
    const html = renderFormula([{k:'password', lbl:'password', v:'"pw123"'}]);
    expect(html).toContain('formula-block password');
    expect(html).toContain('formula-blk-lbl');
    expect(html).toContain('formula-blk-val');
    expect(html).toContain('"pw123"');
  });

  it('renders hash block with correct class', () => {
    const html = renderFormula([{k:'hash', lbl:'hash', v:'abc123…'}]);
    expect(html).toContain('formula-block hash');
    expect(html).toContain('abc123…');
  });

  it('renders salt block with correct class', () => {
    const html = renderFormula([{k:'salt', lbl:'salt', v:'"x7Qm9p"'}]);
    expect(html).toContain('formula-block salt');
  });

  it('renders missing block with correct class', () => {
    const html = renderFormula([{k:'missing', lbl:'missing!', v:'pepper ???'}]);
    expect(html).toContain('formula-block missing');
    expect(html).toContain('pepper ???');
  });

  it('falls back to key as label when lbl is omitted', () => {
    const html = renderFormula([{k:'breach', v:'cracked'}]);
    expect(html).toContain('breach');
  });

  it('renders multiple tokens in sequence', () => {
    const html = renderFormula([
      {k:'password', lbl:'pw', v:'abc'},
      {k:'op', v:'→'},
      {k:'hash', lbl:'hash', v:'xyz'},
    ]);
    expect(html).toContain('formula-block password');
    expect(html).toContain('formula-op');
    expect(html).toContain('formula-block hash');
    // preserves order
    const pwIdx   = html.indexOf('formula-block password');
    const opIdx   = html.indexOf('formula-op');
    const hashIdx = html.indexOf('formula-block hash');
    expect(pwIdx).toBeLessThan(opIdx);
    expect(opIdx).toBeLessThan(hashIdx);
  });
});
