// Estructura para un único ejemplo dentro de una definición
export interface DefinitionExample {
  original: string;
  translation: string;
}

// Estructura para una única definición
export interface Definition {
  translation: string;
  examples: DefinitionExample[];
}

// Estructura para un único resultado del scraper (ej. "help" como verbo)
export interface DictionaryResult {
  word: string;
  phonetic: string;
  partOfSpeech: string;
  // Ahora puede tener múltiples audios (UK, US)
  audios: {
    region: 'UK' | 'US';
    url: string;
  }[];
  definitions: Definition[];
}

// El tipo de la respuesta final que devuelve el scraper
export type ScraperResponse = DictionaryResult[];