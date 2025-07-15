export interface DefinitionExample {
  original: string;
  translation: string;
}

export interface Definition {
  translation: string;
  examples: DefinitionExample[];
}

export interface DictionaryResult {
  word: string;
  phonetic: string;
  partOfSpeech: string;
  audios: {
    region: 'UK' | 'US';
    url: string;
  }[];
  definitions: Definition[];
}

export type ScraperResponse = DictionaryResult[];