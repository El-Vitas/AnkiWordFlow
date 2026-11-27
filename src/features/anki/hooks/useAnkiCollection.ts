import { useEffect, useState } from 'react';
import { t } from '../../../lib/i18n';
import { sendToBackground } from '../../../lib/messaging';
import type { BackgroundResponse } from '../../../types/messages';

export interface AnkiCollection {
  version: number;
  decks: string[];
  models: string[];
}

export type AnkiCollectionState =
  | { phase: 'loading' }
  | { phase: 'ready'; collection: AnkiCollection }
  | { phase: 'error'; message: string };

const valueOf = <T,>(response: BackgroundResponse<T>): T => {
  if (response.ok) return response.value;
  throw new Error(response.code === 'unreachable' ? t('ankiUnreachable') : t('ankiError', response.message));
};

/** Asks AnkiConnect for its decks and note types while `enabled` is true. */
export const useAnkiCollection = (enabled: boolean): AnkiCollectionState => {
  const [state, setState] = useState<AnkiCollectionState>({ phase: 'loading' });

  useEffect(() => {
    if (!enabled) return;
    let isCurrent = true;
    Promise.all([
      sendToBackground<number>({ type: 'ANKI_VERSION' }),
      sendToBackground<string[]>({ type: 'ANKI_DECK_NAMES' }),
      sendToBackground<string[]>({ type: 'ANKI_MODEL_NAMES' }),
    ])
      .then(([version, decks, models]) => ({ version: valueOf(version), decks: valueOf(decks), models: valueOf(models) }))
      .then((collection) => isCurrent && setState({ phase: 'ready', collection }))
      .catch((error: Error) => isCurrent && setState({ phase: 'error', message: error.message }));
    return () => {
      isCurrent = false;
    };
  }, [enabled]);

  return state;
};

/** The field names of an Anki note type, or an empty list while they load or if they cannot be read. */
export const useModelFields = (modelName: string, enabled: boolean): string[] => {
  const [fields, setFields] = useState<string[]>([]);

  useEffect(() => {
    if (!enabled || !modelName) return;
    let isCurrent = true;
    void sendToBackground<string[]>({ type: 'ANKI_MODEL_FIELD_NAMES', modelName }).then((response) => {
      if (isCurrent) setFields(response.ok ? response.value : []);
    });
    return () => {
      isCurrent = false;
    };
  }, [modelName, enabled]);

  return fields;
};
