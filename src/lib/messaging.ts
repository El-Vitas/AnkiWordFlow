import type { BackgroundMessage, BackgroundResponse } from '../types/messages';

/**
 * Sends a message to the background and always resolves: a service worker that failed or answered nothing
 * becomes an error response instead of an exception or `undefined`.
 */
export const sendToBackground = async <T>(message: BackgroundMessage): Promise<BackgroundResponse<T>> => {
  try {
    const response = (await chrome.runtime.sendMessage(message)) as BackgroundResponse<T> | undefined;
    return response ?? { ok: false, code: 'unknown', message: 'No response from the extension' };
  } catch (error) {
    return { ok: false, code: 'unknown', message: error instanceof Error ? error.message : String(error) };
  }
};
