/**
 * renderFormula — pure function, shared between index.html and unit tests.
 *
 * @param {Array|null} f  Array of token objects:
 *   { k: 'op'|'fn'|string, v: string, lbl?: string }
 * @returns {string} HTML string
 */
export function renderFormula(f) {
  if (!f || !f.length) return '';
  return '<div class="formula-row">' + f.map(item => {
    if (item.k === 'op') return `<span class="formula-op">${item.v}</span>`;
    if (item.k === 'fn') return `<span class="formula-fn">${item.v}</span>`;
    return `<div class="formula-block ${item.k}"><div class="formula-blk-lbl">${item.lbl || item.k}</div><div class="formula-blk-val">${item.v}</div></div>`;
  }).join('') + '</div>';
}
