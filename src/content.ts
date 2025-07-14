let iframe: HTMLIFrameElement | null = null;
let dataForTooltip: unknown = null; // Variable para guardar los datos temporalmente

const removeTooltip = (): void => {
  if (iframe) {
    iframe.remove();
    iframe = null;
    dataForTooltip = null; // Limpiamos los datos también
  }
};

const handleMouseUp = async (): Promise<void> => {
  removeTooltip();

  const selection = window.getSelection();
  const selectedText = selection?.toString().trim();

  if (selectedText && selection) {
    try {
      const definitionData = await chrome.runtime.sendMessage({
        type: 'FETCH_DEFINITION',
        text: selectedText
      });

      if (definitionData) {
        // 1. Guardamos los datos en la variable en lugar de enviarlos
        dataForTooltip = definitionData;

        // 2. Creamos el iframe (sin la lógica de 'onload')
        iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.zIndex = '99999';
        iframe.style.border = 'none';
        iframe.style.width = '350px';
        iframe.style.height = '180px';
        iframe.src = chrome.runtime.getURL('tooltip.html');

        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        iframe.style.top = `${rect.bottom + window.scrollY + 8}px`;
        iframe.style.left = `${rect.left + window.scrollX}px`;
        
        document.body.appendChild(iframe);
      }
    } catch (error) {
      console.error("Content Script: Error al comunicar con el background:", error);
    }
  }
};

// 3. Añadimos un listener para recibir el "saludo" del iframe
const handleIframeMessage = (event: MessageEvent): void => {
  // Nos aseguramos de que el mensaje venga del iframe que hemos creado
  if (iframe && event.source === iframe.contentWindow && event.data.type === 'TOOLTIP_READY') {
    // 4. Ahora que sabemos que el tooltip está listo, le enviamos los datos guardados
    iframe.contentWindow?.postMessage(dataForTooltip, '*');
  }
};

// Registramos los listeners
window.addEventListener('message', handleIframeMessage);
document.addEventListener('mouseup', handleMouseUp);
document.addEventListener('mousedown', (event: MouseEvent): void => {
  if (iframe && event.target instanceof Node && !iframe.contains(event.target)) {
    removeTooltip();
  }
});