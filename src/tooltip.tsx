import React, { useState, useEffect } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import './index.css';
import { useStorage } from './hooks/useStorage';
import type { DictionaryResult, ScraperResponse } from './types/tooltip';
import type { AnkiNote} from './types/anki';

const AudioButton: React.FC<{ region: string; url: string; isSelected: boolean; onSelect: () => void; }> = ({ region, url, isSelected, onSelect }) => {
  const playAudio = () => {
    new Audio(url).play();
    onSelect();
  };
  return (
    <button onClick={playAudio} className={`px-2 py-1 text-xs border rounded-md ${isSelected ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}>
      {region}
    </button>
  );
};

const DictionaryResultCard: React.FC<{ result: DictionaryResult }> = ({ result }) => {
  const { settings } = useStorage();
  const [isAdding, setIsAdding] = useState(false);
  const [selectedAudioUrl, setSelectedAudioUrl] = useState<string | undefined>(undefined);

  const handleAddNote = async () => {
    if (!settings) return;
    setIsAdding(true);

    const { ankiFieldMappings: mappings, ankiAllowDuplicates, ankiTags, selectedDeck, selectedAnkiModel } = settings;
    
    // Construcción dinámica de los campos
    const fields: { [key: string]: string } = {};
    if (mappings.expression) fields[mappings.expression] = result.word;
    if (mappings.pronunciation) fields[mappings.pronunciation] = result.phonetic;
    if (mappings.definition) fields[mappings.definition] = result.definitions.map(d => d.translation).join('<br>');
    // Puedes añadir más mapeos aquí

    const note: AnkiNote = {
      deckName: selectedDeck,
      modelName: selectedAnkiModel,
      fields,
      options: { allowDuplicate: ankiAllowDuplicates },
      tags: ankiTags,
    };

    // Añade el audio si se ha seleccionado uno y hay un campo mapeado para él
    if (selectedAudioUrl && mappings.audio) {
      note.audio = [{
        url: selectedAudioUrl,
        filename: `ankimine_${result.word}_${Date.now()}.mp3`,
        fields: [mappings.audio],
      }];
    }

    try {
      const response = await chrome.runtime.sendMessage({ type: 'ANKI_ADD_NOTE', note });
      if (response?.error) {
        alert(`Error al guardar en Anki: ${response.error}`);
      } else {
        alert(`¡Nota para "${result.word}" guardada con éxito!`);
      }
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-xl border border-gray-200 text-black max-w-sm flex flex-col gap-3">
      <header className="flex justify-between items-start">
        <div>
          <span className="font-bold text-xl text-blue-700">{result.word}</span>
          <span className="text-gray-500 ml-2">{result.phonetic}</span>
          <span className="italic text-gray-600 ml-2">{result.partOfSpeech}</span>
        </div>
        <div className="flex gap-2">
          {result.audios.map(audio => (
            <AudioButton key={audio.region} region={audio.region} url={audio.url} isSelected={selectedAudioUrl === audio.url} onSelect={() => setSelectedAudioUrl(audio.url)} />
          ))}
        </div>
      </header>
      <main className="flex flex-col gap-2">
        {result.definitions.map((def, index) => (
          <div key={index}>
            <p className="text-md font-semibold text-gray-800">{def.translation}</p>
            {def.examples.slice(0, 2).map((ex, i) => (
              <div key={i} className="pl-3 mt-1 border-l-2 border-gray-200">
                <p className="text-sm text-gray-700">{ex.original}</p>
                <p className="text-sm text-gray-500 italic">{ex.translation}</p>
              </div>
            ))}
          </div>
        ))}
      </main>
      <footer className="mt-2 pt-3 border-t border-gray-200">
        <button onClick={handleAddNote} disabled={isAdding} className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400">
          {isAdding ? 'Añadiendo...' : 'Añadir a Anki'}
        </button>
      </footer>
    </div>
  );
};

export const TooltipApp: React.FC = () => {
  const [results, setResults] = useState<ScraperResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    window.parent.postMessage({ type: 'TOOLTIP_READY' }, '*');
    const handleMessage = (event: MessageEvent) => {
      if (event.data && Array.isArray(event.data)) {
        setResults(event.data);
        setIsLoading(false);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  if (isLoading) return <div className="p-4 text-sm text-center text-gray-500">Buscando...</div>;
  if (!results || results.length === 0) return <div className="p-4 text-sm text-center text-red-500">No se encontraron resultados.</div>;

  return (
    <div className="flex flex-col gap-4 p-2 bg-transparent">
      {results.map((result, index) => (
        <DictionaryResultCard key={index} result={result} />
      ))}
    </div>
  );
};

const container = document.getElementById('root');
if (container) {
  const root: Root = createRoot(container);
  root.render(<React.StrictMode><TooltipApp /></React.StrictMode>);
}