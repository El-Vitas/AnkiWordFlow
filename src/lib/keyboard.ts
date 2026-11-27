import { AutoSelectKey } from '../types/storage';

const KEY_NAMES: Record<Exclude<AutoSelectKey, 'off'>, string> = {
  alt: 'Alt',
  shift: 'Shift',
  ctrl: 'Control',
};

type KeyEventLike = Pick<KeyboardEvent, 'key' | 'repeat' | 'target'>;

const isEditable = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
};

/**
 * Whether a keydown is the auto-select key pressed on its own. Shift+A while typing, Ctrl+C or a held key
 * that repeats must not trigger a lookup, and neither does anything typed in a form field.
 */
export const isAutoSelectTrigger = (event: KeyEventLike, autoSelectKey: AutoSelectKey): boolean =>
  autoSelectKey !== AutoSelectKey.Off &&
  event.key === KEY_NAMES[autoSelectKey] &&
  !event.repeat &&
  !isEditable(event.target);
