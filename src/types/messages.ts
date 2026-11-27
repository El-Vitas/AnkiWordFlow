import type { AnkiNote } from './anki';
import type { LookupRequest } from './tooltip';

/** Messages to the background service worker. Web pages cannot send these: only the extension's own scripts can. */
export type BackgroundMessage =
  | { type: 'LOOKUP_SET'; lookup: LookupRequest }
  | { type: 'LOOKUP_GET' }
  | { type: 'ANKI_VERSION' }
  | { type: 'ANKI_DECK_NAMES' }
  | { type: 'ANKI_MODEL_NAMES' }
  | { type: 'ANKI_MODEL_FIELD_NAMES'; modelName: string }
  | { type: 'ANKI_ADD_NOTE'; note: AnkiNote };

export type AnkiErrorCode = 'unreachable' | 'duplicate' | 'anki' | 'unknown';

export type BackgroundResponse<T> = { ok: true; value: T } | { ok: false; code: AnkiErrorCode; message: string };

/** Messages between the content script and the tooltip iframe. They carry no lookup data, only layout. */
export type FrameMessage = { type: 'AWF_RESIZE'; height: number } | { type: 'AWF_CLOSE' };
