import type { DictionaryResult, Definition, ScraperResponse } from '../../types/tooltip';

export class CambridgeDictionary {
  private getText(node: Element | null): string {
    return node?.textContent?.trim() || '';
  }

  public parse(html: string): ScraperResponse {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    const results: DictionaryResult[] = [];
    const entries = doc.querySelectorAll('.pr.entry-body__el');

    entries.forEach(entry => {
      const headword = this.getText(entry.querySelector('.headword .hw'));
      if (!headword) return;

      const phonetic = this.getText(entry.querySelector('.pron .ipa'));
      const partOfSpeech = this.getText(entry.querySelector('.posgram .pos'));
      
      // Buscamos ambos audios
      const ukAudioSrc = entry.querySelector('.uk.dloc source[type="audio/mpeg"]')?.getAttribute('src');
      const usAudioSrc = entry.querySelector('.us.dloc source[type="audio/mpeg"]')?.getAttribute('src');

      const audios: { region: 'UK' | 'US'; url: string }[] = [];
      if (ukAudioSrc) audios.push({ region: 'UK', url: `https://dictionary.cambridge.org${ukAudioSrc}` });
      if (usAudioSrc) audios.push({ region: 'US', url: `https://dictionary.cambridge.org${usAudioSrc}` });

      const result: DictionaryResult = {
        word: headword,
        phonetic: phonetic ? `/${phonetic}/` : '',
        partOfSpeech,
        audios,
        definitions: [],
      };

      const senseBlocks = entry.querySelectorAll('.sense-body .def-block');
      senseBlocks.forEach(block => {
        const translation = this.getText(block.querySelector('.def-body .trans'));
        if (!translation) return;

        const definition: Definition = {
          translation,
          examples: [],
        };

        const exampleBlocks = block.querySelectorAll('.examp');
        exampleBlocks.forEach(examp => {
          const original = this.getText(examp.querySelector('.eg'));
          const exampTrans = this.getText(examp.querySelector('.trans'));
          if (original) {
            definition.examples.push({ original, translation: exampTrans });
          }
        });
        result.definitions.push(definition);
      });

      if (result.definitions.length > 0) {
        results.push(result);
      }
    });

    return results;
  }
}