/** Which Anki field receives each piece of data the extension collects. An empty string skips it. */
export interface AnkiFieldMappings {
  expression: string;
  pronunciation: string;
  definition: string;
  definitions: string;
  note: string;
  extraInfo: string;
  url: string;
  audio: string;
  examples: string;
}

export interface AnkiMedia {
  url: string;
  filename: string;
  fields: string[];
}

export interface AnkiNote {
  deckName: string;
  modelName: string;
  fields: Record<string, string>;
  options: {
    allowDuplicate: boolean;
    duplicateScope: 'deck' | 'collection';
    duplicateScopeOptions: {
      deckName: string;
      checkChildren: boolean;
      checkAllModels: boolean;
    };
  };
  audio?: AnkiMedia[];
  tags: string[];
}
