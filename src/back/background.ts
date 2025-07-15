import { AnkiConnectService } from '../lib/anki/ankiconnect';
import type { AnkiNote } from '../types/anki';

const ankiService = new AnkiConnectService();

type ExtensionMessage = 
  | { type: 'FETCH_HTML'; url: string }
  | { type: 'ANKI_GET_VERSION' }
  | { type: 'ANKI_GET_DECK_NAMES' }
  | { type: 'ANKI_GET_MODEL_NAMES' }
  | { type: 'ANKI_GET_MODEL_FIELD_NAMES'; modelName: string }
  | { type: 'ANKI_ADD_NOTE'; note: AnkiNote };

chrome.runtime.onMessage.addListener(
  (message: ExtensionMessage, _sender, sendResponse) => {
    if (message.type === "FETCH_HTML") {
      const fetchHtml = async () => {
        try {
          const response = await fetch(message.url, {
            headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36" },
          });
          if (!response.ok) throw new Error(`Error de red: ${response.statusText}`);
          const html = await response.text();
          sendResponse({ html });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Error desconocido";
          sendResponse({ error: errorMessage });
        }
      };
      fetchHtml();
      return true;
    }

    if (message.type.startsWith("ANKI_")) {
      const handleAnkiRequest = async () => {
        try {
          switch (message.type) {
            case "ANKI_GET_VERSION":
              return await ankiService.getVersion();
            case "ANKI_GET_DECK_NAMES":
              return await ankiService.getDeckNames();
            case "ANKI_GET_MODEL_NAMES":
              return await ankiService.getModelNames();
            case "ANKI_GET_MODEL_FIELD_NAMES":
              return await ankiService.getModelFieldNames(message.modelName);
            
            case "ANKI_ADD_NOTE": {
              const { note } = message;

              if (note.options && !note.options.allowDuplicate) {
                const firstFieldName = Object.keys(note.fields)[0];
                const firstFieldValue = note.fields[firstFieldName];
                
                const query = `deck:"${note.deckName}" "${firstFieldName}:${firstFieldValue}"`;
                
                const duplicateNotes = await ankiService.findNotes(query);
                
                if (duplicateNotes.length > 0) {
                  throw new Error('La nota ya existe en este mazo.');
                }
                note.options = {allowDuplicate: true};
                return await ankiService.addNote(note as AnkiNote);
              }
              
              return await ankiService.addNote(note);
            }

            default:
              throw new Error(`Acción de Anki desconocida.`);
          }
        } catch (error) {
          return { error: error instanceof Error ? error.message : "Error desconocido" };
        }
      };
      handleAnkiRequest().then(sendResponse);
      return true;
    }
  }
);