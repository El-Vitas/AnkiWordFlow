import type { AnkiFieldMappings } from '../types/anki';
import { AnkiExportMode, AutoSelectKey, defaultSettings, type ExtensionSettings } from '../types/storage';

/** Version 1.0 called the examples field `picture`; its value is carried over to `examples`. */
type StoredMappings = Partial<AnkiFieldMappings> & { picture?: string };

const isOneOf = <T extends string>(value: unknown, allowed: Record<string, T>): value is T =>
  Object.values(allowed).includes(value as T);

/** Fills what is missing from stored settings with the defaults and upgrades older shapes. */
export const normalizeSettings = (stored: Partial<ExtensionSettings>): ExtensionSettings => {
  const storedMappings: StoredMappings = stored.ankiFieldMappings ?? {};
  const { picture, ...mappings } = storedMappings;
  return {
    ...defaultSettings,
    ...stored,
    // 1.0 offered an «ankiweb» mode that never worked; it falls back to no export.
    ankiExportMode: isOneOf(stored.ankiExportMode, AnkiExportMode)
      ? stored.ankiExportMode
      : stored.ankiExportMode === undefined
        ? defaultSettings.ankiExportMode
        : AnkiExportMode.None,
    autoSelectKey: isOneOf(stored.autoSelectKey, AutoSelectKey) ? stored.autoSelectKey : defaultSettings.autoSelectKey,
    ankiFieldMappings: {
      ...defaultSettings.ankiFieldMappings,
      ...mappings,
      examples: mappings.examples ?? picture ?? defaultSettings.ankiFieldMappings.examples,
    },
    ankiTags: (stored.ankiTags ?? defaultSettings.ankiTags).map((tag) => tag.trim()).filter(Boolean),
  };
};

const SETTING_KEYS = Object.keys(defaultSettings) as (keyof ExtensionSettings)[];

export const loadSettings = async (): Promise<ExtensionSettings> =>
  normalizeSettings(await chrome.storage.local.get<Partial<ExtensionSettings>>(SETTING_KEYS));

/** The dictionary a lookup uses: the main one if it is still active, otherwise none. */
export const isLookupEnabled = (settings: ExtensionSettings): boolean =>
  settings.isExtensionActive && settings.activeDictionaries[settings.mainDictionary] === true;
