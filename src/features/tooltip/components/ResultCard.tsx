import { useState } from 'react';
import { buildNote } from '../../../lib/anki/note';
import { t } from '../../../lib/i18n';
import { sendToBackground } from '../../../lib/messaging';
import { AnkiExportMode, type ExtensionSettings } from '../../../types/storage';
import type { DictionaryAudio, DictionaryResult, LookupRequest } from '../../../types/tooltip';
import { ankiErrorMessage } from '../frame';

type SaveState = { phase: 'idle' } | { phase: 'saving' } | { phase: 'saved' } | { phase: 'failed'; message: string };

const MAX_EXAMPLES_SHOWN = 2;
const MAX_CONTEXT_SHOWN = 200;

const AudioButton = ({ audio, isSelected, onSelect }: { audio: DictionaryAudio; isSelected: boolean; onSelect: () => void }) => (
  <button
    type="button"
    aria-pressed={isSelected}
    title={t('playPronunciation', audio.region)}
    onClick={() => {
      onSelect();
      new Audio(audio.url).play().catch(() => undefined);
    }}
    className={`px-2 py-1 text-xs border rounded-md ${isSelected ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'}`}
  >
    🔊 {audio.region}
  </button>
);

interface ResultCardProps {
  result: DictionaryResult;
  lookup: LookupRequest;
  settings: ExtensionSettings;
}

export const ResultCard = ({ result, lookup, settings }: ResultCardProps) => {
  const [audioUrl, setAudioUrl] = useState(result.audios.find((audio) => audio.region === 'UK')?.url ?? result.audios[0]?.url);
  const [save, setSave] = useState<SaveState>({ phase: 'idle' });
  const canExport = settings.ankiExportMode === AnkiExportMode.AnkiConnect;

  const addToAnki = async () => {
    setSave({ phase: 'saving' });
    const note = buildNote(result, lookup.contextSentence, settings, audioUrl);
    const response = await sendToBackground<number>({ type: 'ANKI_ADD_NOTE', note });
    setSave(response.ok ? { phase: 'saved' } : { phase: 'failed', message: ankiErrorMessage(response.code, response.message) });
  };

  return (
    <article className="p-4 bg-white flex flex-col gap-3 text-gray-900">
      <header className="flex justify-between items-start gap-2 pr-5">
        <div className="min-w-0">
          <span className="font-bold text-xl text-blue-700">{result.word}</span>
          <span className="text-gray-500 ml-2">{result.phonetic}</span>
          <span className="italic text-gray-600 ml-2">{result.partOfSpeech}</span>
        </div>
        <div className="flex gap-1 shrink-0">
          {result.audios.map((audio) => (
            <AudioButton key={audio.region} audio={audio} isSelected={audioUrl === audio.url} onSelect={() => setAudioUrl(audio.url)} />
          ))}
        </div>
      </header>

      <ol className="flex flex-col gap-2">
        {result.definitions.map((definition, index) => (
          <li key={index}>
            <p className="font-semibold text-gray-800">{definition.translation}</p>
            {definition.examples.slice(0, MAX_EXAMPLES_SHOWN).map((example, exampleIndex) => (
              <div key={exampleIndex} className="pl-3 mt-1 border-l-2 border-gray-200 text-sm">
                <p className="text-gray-700">{example.original}</p>
                <p className="text-gray-500 italic">{example.translation}</p>
              </div>
            ))}
          </li>
        ))}
      </ol>

      {lookup.contextSentence && (
        <section className="pt-3 border-t border-gray-100">
          <h2 className="text-xs font-bold text-gray-500 uppercase mb-1">{t('context')}</h2>
          <p className="text-sm italic text-gray-600 bg-gray-50 p-2 rounded-md" title={lookup.contextSentence}>
            {lookup.contextSentence.length > MAX_CONTEXT_SHOWN ? `${lookup.contextSentence.slice(0, MAX_CONTEXT_SHOWN)}…` : lookup.contextSentence}
          </p>
        </section>
      )}

      {canExport ? (
        <footer className="flex flex-col gap-2">
          <button
            type="button"
            onClick={addToAnki}
            disabled={save.phase === 'saving' || save.phase === 'saved'}
            className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            {save.phase === 'saving' ? t('adding') : save.phase === 'saved' ? t('added') : t('addToAnki')}
          </button>
          <p role="status" className={`text-xs text-center ${save.phase === 'failed' ? 'text-red-600' : 'text-green-700'}`}>
            {save.phase === 'failed' ? save.message : save.phase === 'saved' ? t('noteSaved', result.word, settings.selectedDeck) : ''}
          </p>
        </footer>
      ) : (
        <p className="text-xs text-gray-500 text-center">{t('exportDisabled')}</p>
      )}
    </article>
  );
};
