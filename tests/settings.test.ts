import { describe, expect, it } from 'vitest';
import { isLookupEnabled, normalizeSettings } from '../src/lib/settings';
import { defaultSettings, type ExtensionSettings } from '../src/types/storage';

describe('normalizeSettings', () => {
  it('fills a fresh install with the defaults', () => {
    expect(normalizeSettings({})).toEqual(defaultSettings);
  });

  it('keeps what the user saved and fills only what is missing', () => {
    const settings = normalizeSettings({ selectedDeck: 'English', ankiFieldMappings: { expression: 'Word' } as never });

    expect(settings.selectedDeck).toBe('English');
    expect(settings.ankiFieldMappings.expression).toBe('Word');
    expect(settings.ankiFieldMappings.definition).toBe(defaultSettings.ankiFieldMappings.definition);
  });

  it('carries the 1.0 «picture» mapping over to «examples»', () => {
    const stored = { ankiFieldMappings: { picture: 'Picture' } } as unknown as Partial<ExtensionSettings>;

    expect(normalizeSettings(stored).ankiFieldMappings.examples).toBe('Picture');
    expect(normalizeSettings(stored).ankiFieldMappings).not.toHaveProperty('picture');
  });

  it('turns export off for the «ankiweb» mode 1.0 offered but never implemented', () => {
    expect(normalizeSettings({ ankiExportMode: 'ankiweb' as never }).ankiExportMode).toBe('none');
  });

  it('drops empty tags left by stray commas or spaces', () => {
    expect(normalizeSettings({ ankiTags: ['english', ' ', '', ' vocab '] }).ankiTags).toEqual(['english', 'vocab']);
  });
});

describe('isLookupEnabled', () => {
  it('needs the extension on and the main dictionary active', () => {
    expect(isLookupEnabled(defaultSettings)).toBe(true);
    expect(isLookupEnabled({ ...defaultSettings, isExtensionActive: false })).toBe(false);
    expect(isLookupEnabled({ ...defaultSettings, activeDictionaries: { enes_cambridge: false } })).toBe(false);
    expect(isLookupEnabled({ ...defaultSettings, mainDictionary: '' })).toBe(false);
  });
});
