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
  picture: string;
}

export interface AnkiNote {
  deckName: string;
  modelName: string;
  fields: { [key: string]: string };
  options?: {
    allowDuplicate: boolean;
    duplicateScope?: "deck" | "collection";
    duplicateScopeOptions?: {
      deckName?: string;
      checkChildren?: boolean;
      checkAllModels?: false
    };
  };
  audio?: {
    url: string;
    filename: string;
    fields: string[];
  }[];
  picture?: {
    url: string;
    filename: string;
    fields: string[];
  }[];
  tags: string[];
}