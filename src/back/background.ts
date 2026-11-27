import { AnkiConnectError, ankiConnect } from '../lib/anki/ankiconnect';
import type { BackgroundMessage, BackgroundResponse } from '../types/messages';
import type { LookupRequest } from '../types/tooltip';

/** The last selection of each tab, kept in session storage so it survives the service worker sleeping. */
const lookupKey = (tabId: number): string => `lookup:${tabId}`;

const answer = async <T>(work: () => Promise<T>): Promise<BackgroundResponse<T>> => {
  try {
    return { ok: true, value: await work() };
  } catch (error) {
    if (error instanceof AnkiConnectError) return { ok: false, code: error.code, message: error.message };
    return { ok: false, code: 'unknown', message: error instanceof Error ? error.message : String(error) };
  }
};

const requireTab = (sender: chrome.runtime.MessageSender): number => {
  if (sender.tab?.id === undefined) throw new Error('This message is only valid from a tab');
  return sender.tab.id;
};

const handle = (message: BackgroundMessage, sender: chrome.runtime.MessageSender): Promise<BackgroundResponse<unknown>> => {
  switch (message.type) {
    case 'LOOKUP_SET':
      return answer(() => chrome.storage.session.set({ [lookupKey(requireTab(sender))]: message.lookup }));
    case 'LOOKUP_GET':
      return answer(async () => {
        const key = lookupKey(requireTab(sender));
        const stored = await chrome.storage.session.get<Record<string, LookupRequest | undefined>>(key);
        return stored[key] ?? null;
      });
    case 'ANKI_VERSION':
      return answer(ankiConnect.version);
    case 'ANKI_DECK_NAMES':
      return answer(ankiConnect.deckNames);
    case 'ANKI_MODEL_NAMES':
      return answer(ankiConnect.modelNames);
    case 'ANKI_MODEL_FIELD_NAMES':
      return answer(() => ankiConnect.modelFieldNames(message.modelName));
    case 'ANKI_ADD_NOTE':
      return answer(() => ankiConnect.addNote(message.note));
  }
};

chrome.runtime.onMessage.addListener((message: BackgroundMessage, sender, sendResponse) => {
  if (sender.id !== chrome.runtime.id) return false;
  void handle(message, sender).then(sendResponse);
  return true;
});

chrome.tabs.onRemoved.addListener((tabId) => {
  void chrome.storage.session.remove(lookupKey(tabId));
});
