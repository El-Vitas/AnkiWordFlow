import { describe, expect, it } from 'vitest';
import { buildNote } from '../src/lib/anki/note';
import { defaultSettings, type ExtensionSettings } from '../src/types/storage';
import type { DictionaryResult } from '../src/types/tooltip';

const result: DictionaryResult = {
  word: 'run',
  phonetic: '/rʌn/',
  partOfSpeech: 'verb',
  audios: [{ region: 'UK', url: 'https://dictionary.cambridge.org/uk.mp3' }],
  definitions: [
    { translation: 'correr', examples: [{ original: 'She runs <fast>.', translation: 'Corre "rápido".' }] },
    { translation: 'dirigir', examples: [] },
  ],
  sourceUrl: 'https://dictionary.cambridge.org/dictionary/english-spanish/run?a=1&b=2',
};

const settingsWith = (overrides: Partial<ExtensionSettings>): ExtensionSettings => ({ ...defaultSettings, ...overrides });

const allFields = settingsWith({
  ankiFieldMappings: {
    expression: 'Word',
    pronunciation: 'IPA',
    definition: 'Meaning',
    definitions: 'Meanings',
    note: 'Sentence',
    extraInfo: 'POS',
    url: 'Link',
    audio: 'Sound',
    examples: 'Examples',
  },
});

describe('buildNote', () => {
  it('puts each piece of data in the field it is mapped to', () => {
    const note = buildNote(result, 'I run every day.', allFields);

    expect(note.fields).toMatchObject({
      Word: 'run',
      IPA: '/rʌn/',
      Meaning: 'correr',
      Meanings: 'correr; dirigir',
      Sentence: 'I run every day.',
      POS: 'verb',
    });
  });

  it('escapes everything that comes from the page or the dictionary', () => {
    const note = buildNote(result, '<img src=x onerror=alert(1)>', allFields);

    expect(note.fields.Sentence).toBe('&lt;img src=x onerror=alert(1)&gt;');
    expect(note.fields.Examples).toContain('She runs &lt;fast&gt;.');
    expect(note.fields.Examples).toContain('Corre &quot;rápido&quot;.');
    expect(note.fields.Examples).not.toContain('<fast>');
    expect(note.fields.Link).toBe('https://dictionary.cambridge.org/dictionary/english-spanish/run?a=1&amp;b=2');
  });

  it('skips data mapped to no field and fields that would be empty', () => {
    const note = buildNote(result, '', defaultSettings);

    expect(note.fields).toEqual({ Front: 'run', Back: 'correr' });
  });

  it('joins two kinds of data mapped to the same field instead of overwriting one', () => {
    const settings = settingsWith({ ankiFieldMappings: { ...defaultSettings.ankiFieldMappings, extraInfo: 'Back' } });

    expect(buildNote(result, '', settings).fields.Back).toBe('correr<br>verb');
  });

  it('attaches the chosen audio only when an audio field is mapped', () => {
    expect(buildNote(result, '', defaultSettings, 'https://dictionary.cambridge.org/uk.mp3').audio).toBeUndefined();

    const note = buildNote(result, '', allFields, 'https://dictionary.cambridge.org/uk.mp3');

    expect(note.audio?.[0]).toMatchObject({ url: 'https://dictionary.cambridge.org/uk.mp3', fields: ['Sound'] });
    expect(note.audio?.[0].filename).toMatch(/^ankiwordflow_run_\d+\.mp3$/);
  });

  it('asks AnkiConnect to refuse duplicates in the selected deck unless they are allowed', () => {
    const note = buildNote(result, '', settingsWith({ selectedDeck: 'English', ankiAllowDuplicates: false }));

    expect(note.deckName).toBe('English');
    expect(note.options).toEqual({
      allowDuplicate: false,
      duplicateScope: 'deck',
      duplicateScopeOptions: { deckName: 'English', checkChildren: false, checkAllModels: false },
    });
  });
});
