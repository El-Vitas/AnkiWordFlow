import { describe, expect, it } from 'vitest';
import { sentenceAround } from '../src/lib/text/sentence';

const paragraph = 'The weather was cold. She decided to run home quickly! Nobody saw her leave.';

describe('sentenceAround', () => {
  it('returns the sentence that contains the offset', () => {
    expect(sentenceAround(paragraph, paragraph.indexOf('run'))).toBe('She decided to run home quickly!');
  });

  it('works for the first and the last sentence', () => {
    expect(sentenceAround(paragraph, 4)).toBe('The weather was cold.');
    expect(sentenceAround(paragraph, paragraph.indexOf('leave'))).toBe('Nobody saw her leave.');
  });

  it('collapses line breaks and repeated spaces', () => {
    expect(sentenceAround('A  first\nline.   Second\n\tone here.', 20)).toBe('Second one here.');
  });

  it('cuts a very long sentence around the word', () => {
    const long = `${'word '.repeat(100)}target ${'word '.repeat(100)}end.`;
    const sentence = sentenceAround(long, long.indexOf('target'));

    expect(sentence.length).toBeLessThanOrEqual(302);
    expect(sentence).toContain('target');
    expect(sentence.startsWith('…') && sentence.endsWith('…')).toBe(true);
  });
});
