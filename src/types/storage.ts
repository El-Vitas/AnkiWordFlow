import type { AnkiFieldMappings } from './anki';

export const AutoSelectKey = {
  Off: 'off',
  Alt: 'alt',
  Shift: 'shift',
  Ctrl: 'ctrl',
} as const;
export type AutoSelectKey = (typeof AutoSelectKey)[keyof typeof AutoSelectKey];

export const AnkiExportMode = {
  None: 'none',
  AnkiConnect: 'ankiconnect',
} as const;
export type AnkiExportMode = (typeof AnkiExportMode)[keyof typeof AnkiExportMode];

export type ActiveDictionaries = Record<string, boolean>;

export interface ExtensionSettings {
  isExtensionActive: boolean;
  isMouseSelectionActive: boolean;
  autoSelectKey: AutoSelectKey;
  ankiExportMode: AnkiExportMode;
  activeDictionaries: ActiveDictionaries;
  mainDictionary: string;
  selectedDeck: string;
  selectedAnkiModel: string;
  ankiFieldMappings: AnkiFieldMappings;
  ankiTags: string[];
  ankiAllowDuplicates: boolean;
}

/** The only defaults: every part of the extension reads settings through lib/settings.ts, which uses these. */
export const defaultSettings: ExtensionSettings = {
  isExtensionActive: true,
  isMouseSelectionActive: true,
  autoSelectKey: AutoSelectKey.Off,
  ankiExportMode: AnkiExportMode.AnkiConnect,
  activeDictionaries: { enes_cambridge: true },
  mainDictionary: 'enes_cambridge',
  selectedDeck: 'Default',
  selectedAnkiModel: 'Basic',
  ankiFieldMappings: {
    expression: 'Front',
    pronunciation: '',
    definition: 'Back',
    definitions: '',
    note: '',
    extraInfo: '',
    url: '',
    audio: '',
    examples: '',
  },
  ankiTags: ['AnkiWordFlow'],
  ankiAllowDuplicates: false,
};
