import type { AnkiFieldMappings, AnkiNote } from '../../types/anki';
import type { ExtensionSettings } from '../../types/storage';
import type { DictionaryResult } from '../../types/tooltip';
import { escapeHtml } from '../text/html';

const examplesHtml = (result: DictionaryResult): string =>
  result.definitions
    .filter((definition) => definition.examples.length > 0)
    .map(
      (definition) =>
        `<ul>${definition.examples
          .map((example) => `<li>${escapeHtml(example.original)}<br><i>${escapeHtml(example.translation)}</i></li>`)
          .join('')}</ul>`,
    )
    .join('');

/** The value for each kind of data. Everything that comes from the dictionary or the page is escaped. */
const valuesOf = (result: DictionaryResult, contextSentence: string): Record<keyof AnkiFieldMappings, string> => ({
  expression: escapeHtml(result.word),
  pronunciation: escapeHtml(result.phonetic),
  definition: escapeHtml(result.definitions[0]?.translation ?? ''),
  definitions: result.definitions.map((definition) => escapeHtml(definition.translation)).join('; '),
  note: escapeHtml(contextSentence),
  extraInfo: escapeHtml(result.partOfSpeech),
  url: escapeHtml(result.sourceUrl),
  audio: '',
  examples: examplesHtml(result),
});

const audioFilename = (word: string): string =>
  `ankiwordflow_${word.replace(/[^\p{L}\p{N}]+/gu, '_')}_${Date.now()}.mp3`;

/** Builds the AnkiConnect note for a dictionary result, following the user's field mappings. */
export const buildNote = (
  result: DictionaryResult,
  contextSentence: string,
  settings: ExtensionSettings,
  audioUrl?: string,
): AnkiNote => {
  const mappings = settings.ankiFieldMappings;
  const values = valuesOf(result, contextSentence);
  const fields: Record<string, string> = {};
  for (const key of Object.keys(mappings) as (keyof AnkiFieldMappings)[]) {
    const field = mappings[key];
    if (field && values[key]) fields[field] = fields[field] ? `${fields[field]}<br>${values[key]}` : values[key];
  }
  const note: AnkiNote = {
    deckName: settings.selectedDeck,
    modelName: settings.selectedAnkiModel,
    fields,
    options: {
      allowDuplicate: settings.ankiAllowDuplicates,
      duplicateScope: 'deck',
      duplicateScopeOptions: { deckName: settings.selectedDeck, checkChildren: false, checkAllModels: false },
    },
    tags: settings.ankiTags,
  };
  if (audioUrl && mappings.audio) {
    note.audio = [{ url: audioUrl, filename: audioFilename(result.word), fields: [mappings.audio] }];
  }
  return note;
};
