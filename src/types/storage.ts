// Define el tipo para las teclas de auto-selección.
export type AutoSelectKey = 'off' | 'alt' | 'shift' | 'ctrl';

export const AutoSelectKey = {
  Off: 'off' as AutoSelectKey,
  Alt: 'alt' as AutoSelectKey,
  Shift: 'shift' as AutoSelectKey,
  Ctrl: 'ctrl' as AutoSelectKey,
};

// NUEVO: Tipo para el modo de exportación de Anki
export type AnkiExportMode = 'none' | 'ankiconnect' | 'ankiweb';

export const AnkiExportMode = {
  None: 'none' as AnkiExportMode,
  AnkiConnect: 'ankiconnect' as AnkiExportMode,
  AnkiWeb: 'ankiweb' as AnkiExportMode,
};

// NUEVO: Tipo para el estado de los diccionarios activos
export type ActiveDictionaries = {
  [dictionaryId: string]: boolean;
};

// Define la interfaz de la configuración usando los nuevos tipos.
export interface ExtensionSettings {
  isExtensionActive: boolean;
  isMouseSelectionActive: boolean;
  autoSelectKey: AutoSelectKey;
  ankiExportMode: AnkiExportMode; // Propiedad nueva
  activeDictionaries: ActiveDictionaries; // Propiedad nueva
  mainDictionary: string; // Diccionario principal seleccionado
}

// Define la configuración por defecto.
export const defaultSettings: ExtensionSettings = {
  isExtensionActive: true,
  isMouseSelectionActive: false,
  autoSelectKey: AutoSelectKey.Off,
  ankiExportMode: AnkiExportMode.None,
  activeDictionaries: {
    'dees_larousse': true,
    'dede_dwds': false,
    'enes_cambridge': true,
    'esen_collins': false,
    'fren_cambridge': false,
  },
  mainDictionary: 'enes_cambridge', // 👈 Valor por defecto
};