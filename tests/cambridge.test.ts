import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { cambridgeUrl, parseCambridge } from '../src/lib/dictionaries/cambridge';

/** Real Cambridge pages trimmed to their entries; `node scripts/update-fixtures.mjs` refreshes them. */
const fixture = (name: string): string => readFileSync(join(process.cwd(), 'tests/fixtures/cambridge', `${name}.html`), 'utf8');

describe('cambridgeUrl', () => {
  it('uses Cambridge’s address for the word, hyphenating phrases', () => {
    expect(cambridgeUrl('  Run ')).toBe('https://dictionary.cambridge.org/dictionary/english-spanish/run');
    expect(cambridgeUrl('look up')).toBe('https://dictionary.cambridge.org/dictionary/english-spanish/look-up');
  });

  it('encodes characters that are not safe in a path', () => {
    expect(cambridgeUrl('café?')).toBe('https://dictionary.cambridge.org/dictionary/english-spanish/caf%C3%A9%3F');
  });
});

describe('parseCambridge', () => {
  it('reads one result per part of speech from the main dictionary', () => {
    const results = parseCambridge(fixture('run'), 'https://example.test/run');

    expect(results.map((result) => [result.word, result.partOfSpeech])).toEqual([
      ['run', 'verb'],
      ['run', 'noun'],
    ]);
  });

  it('reads the pronunciation, both audios and the translations with their examples', () => {
    const [verb] = parseCambridge(fixture('run'), 'https://example.test/run');

    expect(verb.phonetic).toMatch(/^\/.+\/$/);
    expect(verb.audios.map((audio) => audio.region)).toEqual(['UK', 'US']);
    expect(verb.audios.every((audio) => audio.url.startsWith('https://dictionary.cambridge.org/') && audio.url.endsWith('.mp3'))).toBe(true);
    expect(verb.definitions.length).toBeGreaterThan(3);
    expect(verb.definitions[0].translation).not.toBe('');
    expect(verb.definitions.some((definition) => definition.examples.some((example) => example.original && example.translation))).toBe(true);
    expect(verb.sourceUrl).toBe('https://example.test/run');
  });

  it('reads phrasal verbs, which only appear in the second dictionary of the page', () => {
    const results = parseCambridge(fixture('look-up'), 'https://example.test/look-up');

    expect(results.map((result) => result.word)).toContain('look something up');
    expect(results.find((result) => result.word === 'look something up')?.definitions[0].translation).toBe('buscar algo');
  });

  it('returns nothing for a word Cambridge does not have', () => {
    expect(parseCambridge(fixture('qwertyzz'), 'https://example.test/qwertyzz')).toEqual([]);
  });

  it('keeps an entry only if it has a headword and at least one translation', () => {
    const html = '<div class="pr entry-body__el"><span class="headword"><span class="hw">empty</span></span></div>';

    expect(parseCambridge(html, 'https://example.test/empty')).toEqual([]);
  });
});
