import { describe, expect, it } from 'vitest';
import { isAutoSelectTrigger } from '../src/lib/keyboard';

const key = (name: string, overrides: { repeat?: boolean; target?: EventTarget | null } = {}) => ({
  key: name,
  repeat: overrides.repeat ?? false,
  target: overrides.target ?? document.body,
});

describe('isAutoSelectTrigger', () => {
  it('fires when the chosen modifier is pressed on its own', () => {
    expect(isAutoSelectTrigger(key('Shift'), 'shift')).toBe(true);
    expect(isAutoSelectTrigger(key('Control'), 'ctrl')).toBe(true);
    expect(isAutoSelectTrigger(key('Alt'), 'alt')).toBe(true);
  });

  it('does not fire for letters typed while the modifier is held (Shift+A, Ctrl+C)', () => {
    expect(isAutoSelectTrigger(key('A'), 'shift')).toBe(false);
    expect(isAutoSelectTrigger(key('c'), 'ctrl')).toBe(false);
  });

  it('does not fire for another modifier, a held key or when it is turned off', () => {
    expect(isAutoSelectTrigger(key('Alt'), 'shift')).toBe(false);
    expect(isAutoSelectTrigger(key('Shift', { repeat: true }), 'shift')).toBe(false);
    expect(isAutoSelectTrigger(key('Shift'), 'off')).toBe(false);
  });

  it('does not fire while typing in a form field or an editable area', () => {
    const input = document.createElement('input');
    const editable = document.createElement('div');
    editable.contentEditable = 'true';
    document.body.append(input, editable);

    expect(isAutoSelectTrigger(key('Shift', { target: input }), 'shift')).toBe(false);
    expect(isAutoSelectTrigger(key('Shift', { target: editable }), 'shift')).toBe(false);
  });
});
