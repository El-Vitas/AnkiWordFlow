// Define todos los campos que el usuario puede mapear desde la UI
export interface AnkiFieldMappings {
  expression: string;
  pronunciation: string;
  definition: string;
  definitions: string;
  note: string;
  extraInfo: string;
  url: string;
  audio: string;
}

// Define la estructura completa de una nota que se enviará a AnkiConnect
export interface AnkiNote {
  deckName: string;
  modelName: string;
  fields: { [key: string]: string };
  options?: {
    allowDuplicate: boolean;
  };
  // El campo de audio es especial y tiene su propia estructura
  audio?: {
    url: string;
    filename: string;
    fields: string[];
  }[];
  tags: string[];
}