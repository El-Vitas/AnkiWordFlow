export interface DefinitionExample {
  original: string;
  translation: string;
}

export interface Definition {
  translation: string;
  examples: DefinitionExample[];
}

export interface DictionaryAudio {
  region: 'UK' | 'US';
  url: string;
}

export interface DictionaryResult {
  word: string;
  phonetic: string;
  partOfSpeech: string;
  audios: DictionaryAudio[];
  definitions: Definition[];
  /** The dictionary page the result came from. */
  sourceUrl: string;
}

/** What the content script hands to the tooltip: the selected text and the sentence it was read in. */
export interface LookupRequest {
  word: string;
  contextSentence: string;
}
