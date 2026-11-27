const MAX_CONTEXT_LENGTH = 300;
const SENTENCE_END = /[.!?…]["')\]]?\s+/g;

/**
 * The sentence of `text` that contains the character at `offset`: the context saved with the word.
 * Sentences end at . ! ? or … followed by space; a very long one is cut around the word.
 */
export const sentenceAround = (text: string, offset: number): string => {
  const normalized = text.replace(/\s+/g, ' ');
  const position = Math.min(Math.max(offset, 0), normalized.length);
  let start = 0;
  let end = normalized.length;
  for (const match of normalized.matchAll(SENTENCE_END)) {
    const boundary = (match.index ?? 0) + match[0].length;
    if (boundary <= position) start = boundary;
    else {
      end = (match.index ?? 0) + match[0].trimEnd().length;
      break;
    }
  }
  const sentence = normalized.slice(start, end).trim();
  if (sentence.length <= MAX_CONTEXT_LENGTH) return sentence;
  const from = Math.max(0, position - start - MAX_CONTEXT_LENGTH / 2);
  return `…${sentence.slice(from, from + MAX_CONTEXT_LENGTH).trim()}…`;
};
