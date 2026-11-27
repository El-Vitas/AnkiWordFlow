import { isAutoSelectTrigger } from './lib/keyboard';
import { sendToBackground } from './lib/messaging';
import { isLookupEnabled, loadSettings } from './lib/settings';
import { sentenceAround } from './lib/text/sentence';
import type { FrameMessage } from './types/messages';
import { defaultSettings, type ExtensionSettings } from './types/storage';

const TOOLTIP_CLASS = 'ankiwordflow-tooltip-iframe';
const TOOLTIP_WIDTH = 380;
const TOOLTIP_GAP = 8;
const VIEWPORT_MARGIN = 12;
/** Longer selections are sentences, not words to look up. */
const MAX_WORDS = 4;
const MAX_LENGTH = 60;

let settings: ExtensionSettings = defaultSettings;
let lastMouse = { x: 0, y: 0 };

const isContextAlive = (): boolean => Boolean(chrome.runtime?.id);

const removeTooltips = (): void => {
  document.querySelectorAll(`.${TOOLTIP_CLASS}`).forEach((node) => node.remove());
};

const isBlock = (element: Element): boolean => !window.getComputedStyle(element).display.startsWith('inline');

/** The sentence around the selection, read from its closest block-level ancestor. */
const contextOf = (range: Range): string => {
  let node: Node | null = range.startContainer;
  while (node && !(node instanceof Element && isBlock(node))) node = node.parentNode;
  const block = node instanceof Element ? node : document.body;
  const before = document.createRange();
  before.setStart(block, 0);
  before.setEnd(range.startContainer, range.startOffset);
  return sentenceAround(block.textContent ?? '', before.toString().replace(/\s+/g, ' ').length);
};

const isLookupWorthy = (text: string): boolean =>
  text.length > 0 && text.length <= MAX_LENGTH && text.split(/\s+/).length <= MAX_WORDS;

const placeTooltip = (iframe: HTMLIFrameElement, rect: DOMRect): void => {
  const maxLeft = window.scrollX + document.documentElement.clientWidth - TOOLTIP_WIDTH - VIEWPORT_MARGIN;
  const left = Math.max(window.scrollX + VIEWPORT_MARGIN, Math.min(rect.left + window.scrollX, maxLeft));
  Object.assign(iframe.style, {
    position: 'absolute',
    top: `${rect.bottom + window.scrollY + TOOLTIP_GAP}px`,
    left: `${left}px`,
    width: `${TOOLTIP_WIDTH}px`,
    height: '120px',
    zIndex: '2147483647',
    border: 'none',
    borderRadius: '12px',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.25)',
    colorScheme: 'normal',
  });
};

const showTooltip = async (selection: Selection): Promise<void> => {
  const word = selection.toString().trim();
  if (!isLookupWorthy(word) || selection.rangeCount === 0) return;
  const range = selection.getRangeAt(0);
  removeTooltips();
  const stored = await sendToBackground<void>({ type: 'LOOKUP_SET', lookup: { word, contextSentence: contextOf(range) } });
  if (!stored.ok) return;
  const iframe = document.createElement('iframe');
  iframe.className = TOOLTIP_CLASS;
  iframe.src = chrome.runtime.getURL('tooltip.html');
  iframe.title = 'AnkiWordFlow';
  placeTooltip(iframe, range.getBoundingClientRect());
  document.body.appendChild(iframe);
};

/** Selects the word under the mouse, as if it had been double-clicked. */
const selectWordUnderMouse = (): Selection | null => {
  const selection = window.getSelection();
  const caret = document.caretRangeFromPoint(lastMouse.x, lastMouse.y);
  if (!selection || !caret) return null;
  selection.removeAllRanges();
  selection.addRange(caret);
  selection.modify('move', 'backward', 'word');
  selection.modify('extend', 'forward', 'word');
  return selection;
};

const onKeyDown = (event: KeyboardEvent): void => {
  if (event.key === 'Escape') return removeTooltips();
  if (!isLookupEnabled(settings) || !isAutoSelectTrigger(event, settings.autoSelectKey)) return;
  const selection = selectWordUnderMouse();
  if (selection) void showTooltip(selection);
};

const onMouseUp = (event: MouseEvent): void => {
  if (event.button !== 0 || !isLookupEnabled(settings) || !settings.isMouseSelectionActive) return;
  const selection = window.getSelection();
  if (selection?.type === 'Range') void showTooltip(selection);
};

const onMouseDown = (event: MouseEvent): void => {
  if (!(event.target instanceof Element && event.target.closest(`.${TOOLTIP_CLASS}`))) removeTooltips();
};

/** Only layout messages from our own tooltip frame are accepted; their content is never trusted beyond that. */
const onFrameMessage = (event: MessageEvent<FrameMessage>): void => {
  const frame = [...document.querySelectorAll<HTMLIFrameElement>(`.${TOOLTIP_CLASS}`)].find(
    (candidate) => candidate.contentWindow === event.source,
  );
  if (!frame) return;
  if (event.data?.type === 'AWF_CLOSE') frame.remove();
  if (event.data?.type === 'AWF_RESIZE' && Number.isFinite(event.data.height)) {
    frame.style.height = `${Math.min(Math.max(event.data.height, 60), 600)}px`;
  }
};

const start = async (): Promise<void> => {
  settings = await loadSettings();
  chrome.storage.onChanged.addListener((_changes, area) => {
    if (area !== 'local' || !isContextAlive()) return;
    void loadSettings().then((fresh) => {
      settings = fresh;
    });
  });
  document.addEventListener('mousemove', (event) => {
    lastMouse = { x: event.clientX, y: event.clientY };
  });
  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('mouseup', onMouseUp);
  document.addEventListener('mousedown', onMouseDown);
  window.addEventListener('message', onFrameMessage);
};

void start();
