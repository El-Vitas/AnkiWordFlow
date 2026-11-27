import { t } from '../../lib/i18n';
import type { AnkiErrorCode, FrameMessage } from '../../types/messages';

/** Layout messages to the page hosting the tooltip. They carry nothing the page could misuse. */
export const postToPage = (message: FrameMessage): void => window.parent.postMessage(message, '*');

export const ankiErrorMessage = (code: AnkiErrorCode, message: string): string => {
  switch (code) {
    case 'unreachable':
      return t('ankiUnreachable');
    case 'duplicate':
      return t('noteDuplicate');
    default:
      return t('ankiError', message);
  }
};
