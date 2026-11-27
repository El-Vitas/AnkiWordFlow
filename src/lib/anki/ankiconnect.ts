import type { AnkiNote } from '../../types/anki';

export const ANKI_CONNECT_URL = 'http://127.0.0.1:8765';
const API_VERSION = 6;
const TIMEOUT_MS = 5000;

/** An AnkiConnect failure the UI can explain: Anki closed, a duplicate note, or Anki's own message. */
export class AnkiConnectError extends Error {
  readonly code: 'unreachable' | 'duplicate' | 'anki';

  constructor(code: AnkiConnectError['code'], message: string) {
    super(message);
    this.name = 'AnkiConnectError';
    this.code = code;
  }
}

const invoke = async <T>(action: string, params: object = {}): Promise<T> => {
  let response: Response;
  try {
    response = await fetch(ANKI_CONNECT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ action, version: API_VERSION, params }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch {
    throw new AnkiConnectError('unreachable', 'AnkiConnect did not answer');
  }
  if (!response.ok) throw new AnkiConnectError('unreachable', `AnkiConnect answered ${response.status}`);
  const data = (await response.json()) as { result: T; error: string | null };
  if (data.error) {
    const code = /duplicate/i.test(data.error) ? 'duplicate' : 'anki';
    throw new AnkiConnectError(code, data.error);
  }
  return data.result;
};

export const ankiConnect = {
  version: (): Promise<number> => invoke<number>('version'),
  deckNames: (): Promise<string[]> => invoke<string[]>('deckNames'),
  modelNames: (): Promise<string[]> => invoke<string[]>('modelNames'),
  modelFieldNames: (modelName: string): Promise<string[]> => invoke<string[]>('modelFieldNames', { modelName }),
  /** AnkiConnect checks duplicates itself, following note.options (scope: the selected deck). */
  addNote: (note: AnkiNote): Promise<number> => invoke<number>('addNote', { note }),
};
