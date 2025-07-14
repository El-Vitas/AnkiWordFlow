import type { TooltipData } from './types/tooltip'; // Asumiendo que mueves el tipo a un archivo central

// Listener para mensajes de otras partes de la extensión
chrome.runtime.onMessage.addListener(
  (message: { type: string; text?: string }, _sender, sendResponse: (response: TooltipData) => void) => {
    // Se asegura de que el mensaje es para buscar una definición y contiene texto
    if (message.type === 'FETCH_DEFINITION' && message.text) {
      const { text } = message;

      // Simula una operación asíncrona, como una llamada a una API
      setTimeout(() => {
        const mockResponse: TooltipData = {
          word: text,
          definition: `Esta es una definición de ejemplo para la palabra "${text}".`,
          context: 'Un ejemplo de uso podría ser dentro de una oración.',
          synonym: 'Ejemplar, Muestra, Prototipo',
        };
        // Devuelve el objeto con los datos
        sendResponse(mockResponse);
      }, 200);

      // Devuelve 'true' para indicar que la respuesta se enviará de forma asíncrona
      return true;
    }
  }
);