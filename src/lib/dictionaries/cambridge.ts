import type { Definition, DictionaryAudio, DictionaryResult } from '../../types/tooltip';

export const CAMBRIDGE_ORIGIN = 'https://dictionary.cambridge.org';
const ENGLISH_SPANISH_PATH = '/dictionary/english-spanish/';

/** Cambridge's own address for a word: lowercase, words joined by hyphens («look up» → look-up). */
export const cambridgeUrl = (word: string): string =>
  `${CAMBRIDGE_ORIGIN}${ENGLISH_SPANISH_PATH}${encodeURIComponent(word.trim().toLowerCase().replace(/\s+/g, '-'))}`;

const textOf = (node: Element | null): string => node?.textContent?.replace(/\s+/g, ' ').trim() ?? '';

const audioOf = (entry: Element, region: DictionaryAudio['region']): DictionaryAudio | null => {
  const source = entry.querySelector(`.${region.toLowerCase()}.dloc source[type="audio/mpeg"]`)?.getAttribute('src');
  return source ? { region, url: new URL(source, CAMBRIDGE_ORIGIN).toString() } : null;
};

const definitionsOf = (entry: Element): Definition[] =>
  [...entry.querySelectorAll('.def-block')].flatMap((block) => {
    const translation = textOf(block.querySelector('.def-body .trans'));
    if (!translation) return [];
    const examples = [...block.querySelectorAll('.examp')]
      .map((example) => ({ original: textOf(example.querySelector('.eg')), translation: textOf(example.querySelector('.trans')) }))
      .filter((example) => example.original);
    return [{ translation, examples }];
  });

/**
 * The entries to read. A page lists the main English–Spanish dictionary first (`.pr.entry-body__el`) and a
 * second, shorter one after it; phrasal verbs such as «look up» only appear in the second.
 */
const entriesOf = (page: Document): Element[] => {
  const main = [...page.querySelectorAll('.pr.entry-body__el')];
  return main.length > 0 ? main : [...page.querySelectorAll('.entry-body__el')];
};

/** Reads every entry (one per part of speech) of a Cambridge English–Spanish page. */
export const parseCambridge = (html: string, sourceUrl: string): DictionaryResult[] => {
  const page = new DOMParser().parseFromString(html, 'text/html');
  return entriesOf(page).flatMap((entry) => {
    const word = textOf(entry.querySelector('.headword .hw')) || textOf(entry.querySelector('.di-title'));
    const definitions = definitionsOf(entry);
    if (!word || definitions.length === 0) return [];
    const phonetic = textOf(entry.querySelector('.pron .ipa'));
    return [
      {
        word,
        phonetic: phonetic ? `/${phonetic}/` : '',
        partOfSpeech: textOf(entry.querySelector('.posgram .pos')),
        audios: [audioOf(entry, 'UK'), audioOf(entry, 'US')].filter((audio) => audio !== null),
        definitions,
        sourceUrl,
      },
    ];
  });
};

export const lookUpCambridge = async (word: string): Promise<DictionaryResult[]> => {
  const url = cambridgeUrl(word);
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Cambridge answered ${response.status}`);
  return parseCambridge(await response.text(), url);
};
