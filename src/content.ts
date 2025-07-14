// Importa el módulo específico del diccionario que vamos a usar
import { CambridgeDictionary } from './lib/dictionaries/cambridge';
import type { ScraperResponse } from './types/tooltip';

let iframe: HTMLIFrameElement | null = null;
let dataForTooltip: ScraperResponse | null = null;

const removeTooltip = (): void => {
  if (iframe) {
    iframe.remove();
    iframe = null;
    dataForTooltip = null;
  }
};

const handleMouseUp = async (): Promise<void> => {
  removeTooltip();

  const selection = window.getSelection();
  const selectedText = selection?.toString().trim();

  if (selectedText && selection) {
    try {
      // --- Lógica del Orquestador ---
      // 1. Decide qué diccionario usar (en el futuro, esto vendrá de las opciones)
      const dictionary = new CambridgeDictionary();
      const url = `https://dictionary.cambridge.org/dictionary/english-spanish/${encodeURIComponent(selectedText)}`;

      // 2. Pide el HTML al background
      const response = await chrome.runtime.sendMessage({ type: 'FETCH_HTML', url });
      if (response.error || !response.html) {
        throw new Error(response.error || 'No se recibió HTML');
      }

      // 3. Usa el módulo de diccionario para parsear el HTML
      const definitionData = dictionary.parse(response.html);
      dataForTooltip = definitionData;

      // 4. Si hay resultados, crea el iframe
      if (definitionData.length > 0) {
        iframe = document.createElement('iframe');
        iframe.src = chrome.runtime.getURL('tooltip.html');
        iframe.style.position = 'absolute';
        iframe.style.zIndex = '99999';
        iframe.style.border = 'none';
        iframe.style.width = '350px';
        iframe.style.height = '180px';
        
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        iframe.style.top = `${rect.bottom + window.scrollY + 8}px`;
        iframe.style.left = `${rect.left + window.scrollX}px`;
        document.body.appendChild(iframe);
      }
    } catch (error) {
      console.error("Content Script: Error en el flujo:", error);
    }
  }
};

const handleIframeMessage = (event: MessageEvent): void => {
  if (iframe && event.source === iframe.contentWindow && event.data.type === 'TOOLTIP_READY') {
    iframe.contentWindow?.postMessage(dataForTooltip, '*');
  }
};

const handleMouseDown = (event: MouseEvent): void => {
  if (iframe && event.target instanceof Node && !iframe.contains(event.target)) {
    removeTooltip();
  }
};

// Listeners
window.addEventListener('message', handleIframeMessage);
document.addEventListener('mouseup', handleMouseUp);
document.addEventListener('mousedown', handleMouseDown);