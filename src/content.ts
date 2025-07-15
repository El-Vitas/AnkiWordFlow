import { CambridgeDictionary } from './lib/dictionaries/cambridge';
import type { ScraperResponse } from './types/tooltip';
import type { ExtensionSettings } from './types/storage';

const TOOLTIP_CLASS_NAME = 'ankiwordflow-tooltip-iframe';
let dataForTooltip: { results: ScraperResponse; contextSentence: string } | null = null;
let lastMousePosition = { x: 0, y: 0 };
let isProcessing = false; 

const defaultSettings: ExtensionSettings = {
  isExtensionActive: true,
  isMouseSelectionActive: true,
  autoSelectKey: 'off',
  ankiExportMode: 'ankiconnect',
  activeDictionaries: { 'enes_cambridge': true },
  mainDictionary: 'enes_cambridge',
  selectedDeck: 'Default',
  selectedAnkiModel: 'Basic',
  ankiFieldMappings: {
    expression: 'Front',
    pronunciation: 'Reading',
    definition: 'Back',
    definitions: '',
    note: 'Note',
    extraInfo: 'ExtraInfo',
    url: 'URL',
    audio: 'Sound',
    picture: 'Picture',
  },
  ankiTags: ['AnkiWordFlow'],
  ankiAllowDuplicates: false,
};

const removeAllTooltips = (): void => {
  document.querySelectorAll(`.${TOOLTIP_CLASS_NAME}`).forEach(node => node.remove());
  dataForTooltip = null;
};

const getContextSentence = (selection: Selection): string => {
  if (!selection.anchorNode) return '';
  let node = selection.anchorNode;
  while (node && node.nodeName !== 'BODY') {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const display = window.getComputedStyle(node as Element).display;
      if (['block', 'list-item', 'table-cell', 'p'].includes(display)) {
        return node.textContent?.trim() || '';
      }
    }
    node = node.parentNode!;
  }
  return node?.textContent?.trim() || '';
};

const processSelection = async (selection: Selection): Promise<void> => {
  if (isProcessing) return; 
  isProcessing = true; 

  const selectedText = selection.toString().trim();
  if (!selectedText) {
    isProcessing = false;
    return;
  }

  removeAllTooltips();

  try {
    const contextSentence = getContextSentence(selection);
    const dictionary = new CambridgeDictionary();
    const url = `https://dictionary.cambridge.org/dictionary/english-spanish/${encodeURIComponent(selectedText)}`;

    const response = await chrome.runtime.sendMessage({ type: 'FETCH_HTML', url });
    if (response.error || !response.html) {
      throw new Error(response.error || 'No se recibió HTML');
    }

    const definitionData = dictionary.parse(response.html);
    dataForTooltip = { results: definitionData, contextSentence };

    if (definitionData.length > 0) {
      const iframe = document.createElement('iframe');
      iframe.className = TOOLTIP_CLASS_NAME;
      iframe.src = chrome.runtime.getURL('tooltip.html');
      iframe.style.position = 'absolute';
      iframe.style.zIndex = '99999';
      iframe.style.border = 'none';
      iframe.style.width = '380px';
      iframe.style.height = 'auto';
      iframe.style.minHeight = '180px';
      iframe.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.2)';
      iframe.style.borderRadius = '0.75rem';
      
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      iframe.style.top = `${rect.bottom + window.scrollY + 8}px`;
      iframe.style.left = `${rect.left + window.scrollX}px`;
      document.body.appendChild(iframe);
    }
  } catch (error) {
    if (!(error instanceof Error && error.message.includes('Extension context invalidated'))) {
      console.error("Content Script: Error en el flujo:", error);
    }
  } finally {
    isProcessing = false; 
  }
};


const handleKeyDown = async (event: KeyboardEvent): Promise<void> => {
  const settings = await chrome.storage.local.get(defaultSettings) as ExtensionSettings;
  if (!settings.isExtensionActive || settings.autoSelectKey === 'off') return;

  const keyMap = { alt: event.altKey, shift: event.shiftKey, ctrl: event.ctrlKey };
  const modifierKey = settings.autoSelectKey as keyof typeof keyMap;

  if (keyMap[modifierKey]) {
    event.preventDefault();
    event.stopPropagation();

    const selection = window.getSelection();
    if (!selection) return;

    const range = document.caretRangeFromPoint(lastMousePosition.x, lastMousePosition.y);
    if (range) {
      selection.removeAllRanges();
      selection.addRange(range);
      selection.modify('move', 'backward', 'word');
      selection.modify('extend', 'forward', 'word');
    }
    
    if (selection.toString().trim() && selection.rangeCount > 0) {
      await processSelection(selection);
    }
  }
};

const handleMouseUp = async (): Promise<void> => {
  const selection = window.getSelection();
  if (!selection || !selection.toString().trim() || selection.type !== 'Range') {
    return;
  }
  
  const settings = (await chrome.storage.local.get(defaultSettings)) as ExtensionSettings;
  if (!settings.isExtensionActive || !settings.isMouseSelectionActive) {
    return;
  }
  
  if (selection.rangeCount > 0) {
    await processSelection(selection);
  }
};

const handleMouseDown = (event: MouseEvent): void => {
  const target = event.target as Element;
  if (!target.closest(`.${TOOLTIP_CLASS_NAME}`)) {
    removeAllTooltips();
  }
};

const handleIframeMessage = (event: MessageEvent): void => {
  const tooltips = document.querySelectorAll<HTMLIFrameElement>(`.${TOOLTIP_CLASS_NAME}`);
  const lastTooltip = tooltips[tooltips.length - 1];
  if (lastTooltip && event.source === lastTooltip.contentWindow && event.data.type === 'TOOLTIP_READY') {
    lastTooltip.contentWindow?.postMessage(dataForTooltip, '*');
  }
};

document.addEventListener('mousemove', (event) => {
  lastMousePosition = { x: event.clientX, y: event.clientY };
});
document.addEventListener('keydown', handleKeyDown);
document.addEventListener('mouseup', handleMouseUp);
document.addEventListener('mousedown', handleMouseDown);
window.addEventListener('message', handleIframeMessage);