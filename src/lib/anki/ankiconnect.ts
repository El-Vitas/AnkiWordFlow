import type { AnkiNote } from '../../types/anki';

export class AnkiConnectService {
  private readonly version = 6;
  private readonly url = 'http://127.0.0.1:8765';

  private async invoke<T>(action: string, params: object = {}): Promise<T> {
    const request = { action, version: this.version, params };
    try {
      const response = await fetch(this.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify(request),
      });
      if (!response.ok) throw new Error(`Error de red: ${response.statusText}`);
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      return data.result as T;
    } catch (e) {
      const error = e instanceof Error ? e.message : String(e);
      console.error(`AnkiConnect Error: ${error}`);
      throw new Error(`No se pudo conectar con AnkiConnect. Asegúrate de que Anki esté abierto y el addon instalado. Error: ${error}`);
    }
  }

  public getDeckNames = async (): Promise<string[]> => {
    return this.invoke<string[]>('deckNames');
  };

  public getModelNames = async (): Promise<string[]> => {
    return this.invoke<string[]>('modelNames');
  };

  public getModelFieldNames = async (modelName: string): Promise<string[]> => {
    return this.invoke<string[]>('modelFieldNames', { modelName });
  };

  public addNote = async (note: AnkiNote): Promise<number | null> => {
    return this.invoke<number | null>('addNote', { note });
  };
  
  public getVersion = async (): Promise<number | null> => {
    try {
      return await this.invoke<number>('version');
    } catch {
      return null;
    }
  };
}