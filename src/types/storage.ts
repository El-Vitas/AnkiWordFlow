// Define el tipo para las teclas de auto-selección.
import type { AnkiFieldMappings } from "./anki";

export type AutoSelectKey = "off" | "alt" | "shift" | "ctrl";

export const AutoSelectKey = {
	Off: "off" as AutoSelectKey,
	Alt: "alt" as AutoSelectKey,
	Shift: "shift" as AutoSelectKey,
	Ctrl: "ctrl" as AutoSelectKey,
};

export type AnkiExportMode = "none" | "ankiconnect" | "ankiweb";

export const AnkiExportMode = {
	None: "none" as AnkiExportMode,
	AnkiConnect: "ankiconnect" as AnkiExportMode,
	AnkiWeb: "ankiweb" as AnkiExportMode,
};

export type ActiveDictionaries = {
	[dictionaryId: string]: boolean;
};

export interface ExtensionSettings {
	isExtensionActive: boolean;
	isMouseSelectionActive: boolean;
	autoSelectKey: string;
	ankiExportMode: AnkiExportMode;
	activeDictionaries: ActiveDictionaries;
	mainDictionary: string;

	selectedDeck: string;
	selectedAnkiModel: string;
	ankiFieldMappings: AnkiFieldMappings;
	ankiTags: string[];
	ankiAllowDuplicates: boolean;
}

export const defaultSettings: ExtensionSettings = {
	isExtensionActive: true,
	isMouseSelectionActive: true,
	autoSelectKey: "off",
	ankiExportMode: AnkiExportMode.None,
	activeDictionaries: { enes_cambridge: true },
	mainDictionary: "enes_cambridge",
	selectedDeck: "Default",
	selectedAnkiModel: "Minado de Oraciones - AnkiMine",
	ankiFieldMappings: {
		expression: "Front",
		pronunciation: "Reading",
		definition: "Back",
		definitions: "Definitions",
		note: "Note",
		extraInfo: "ExtraInfo",
		url: "URL",
		audio: "Sound",
		picture: "Picture",
	},
	ankiTags: ["AnkiWordFlow"],
	ankiAllowDuplicates: false,
};
