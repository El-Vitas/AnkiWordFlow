import { useEffect, useRef, useState } from 'react';
import { dictionaryById } from '../../../lib/dictionaries';
import { t } from '../../../lib/i18n';
import { sendToBackground } from '../../../lib/messaging';
import { isLookupEnabled, loadSettings } from '../../../lib/settings';
import type { ExtensionSettings } from '../../../types/storage';
import type { DictionaryResult, LookupRequest } from '../../../types/tooltip';
import { postToPage } from '../frame';
import { ResultCard } from './ResultCard';

type LoadState =
  | { phase: 'loading' }
  | { phase: 'empty'; word: string }
  | { phase: 'error'; message: string }
  | { phase: 'ready'; lookup: LookupRequest; results: DictionaryResult[]; settings: ExtensionSettings };

/**
 * The tooltip asks the background for the word its tab selected and queries the dictionary itself. It never
 * reads lookup data from the page, so a page cannot slip content into it (or, through it, into Anki).
 */
const loadLookup = async (): Promise<LoadState> => {
  const settings = await loadSettings();
  const response = await sendToBackground<LookupRequest | null>({ type: 'LOOKUP_GET' });
  if (!response.ok || !response.value) return { phase: 'error', message: t('lookupMissing') };
  const lookup = response.value;
  const dictionary = dictionaryById(settings.mainDictionary);
  if (!dictionary || !isLookupEnabled(settings)) return { phase: 'error', message: t('noDictionary') };
  const results = await dictionary.lookUp(lookup.word);
  return results.length > 0 ? { phase: 'ready', lookup, results, settings } : { phase: 'empty', word: lookup.word };
};

export const TooltipApp = () => {
  const [state, setState] = useState<LoadState>({ phase: 'loading' });
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadLookup()
      .then(setState)
      .catch(() => setState({ phase: 'error', message: t('dictionaryUnreachable') }));
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const observer = new ResizeObserver(() => postToPage({ type: 'AWF_RESIZE', height: Math.ceil(root.getBoundingClientRect().height) }));
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={rootRef} className="relative bg-white rounded-xl border border-gray-200 overflow-hidden font-sans">
      <button
        type="button"
        aria-label={t('close')}
        onClick={() => postToPage({ type: 'AWF_CLOSE' })}
        className="absolute top-1 right-2 text-gray-400 hover:text-gray-700 text-lg leading-none"
      >
        ×
      </button>
      {state.phase === 'loading' && <p className="p-4 text-sm text-center text-gray-500">{t('searching')}</p>}
      {state.phase === 'empty' && <p className="p-4 text-sm text-center text-gray-600">{t('noResults', state.word)}</p>}
      {state.phase === 'error' && <p className="p-4 text-sm text-center text-red-600">{state.message}</p>}
      {state.phase === 'ready' &&
        state.results.map((result, index) => (
          <div key={index} className={index > 0 ? 'border-t border-gray-200' : ''}>
            <ResultCard result={result} lookup={state.lookup} settings={state.settings} />
          </div>
        ))}
    </div>
  );
};
