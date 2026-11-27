// Downloads real Cambridge English–Spanish pages for the parser tests and keeps only their dictionary entries,
// so the fixtures stay small. Run it when Cambridge changes its markup: `node scripts/update-fixtures.mjs`.
import { mkdir, writeFile } from 'node:fs/promises';
import { Window } from 'happy-dom';

const WORDS = ['run', 'book', 'look up', 'qwertyzz'];
const OUT_DIR = new URL('../tests/fixtures/cambridge/', import.meta.url);

await mkdir(OUT_DIR, { recursive: true });
for (const word of WORDS) {
  const url = `https://dictionary.cambridge.org/dictionary/english-spanish/${encodeURIComponent(word.replace(/\s+/g, '-'))}`;
  const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 AnkiWordFlow fixtures' } });
  const html = await response.text();
  const window = new Window();
  window.document.write(html);
  const entries = [...window.document.querySelectorAll('.entry-body__el')].map((entry) => entry.outerHTML);
  await window.happyDOM.close();
  const file = new URL(`${word.replace(/\s+/g, '-')}.html`, OUT_DIR);
  await writeFile(file, `<!doctype html><html><body>\n${entries.join('\n')}\n</body></html>\n`);
  console.log(`${word}: HTTP ${response.status}, ${entries.length} entries`);
}
