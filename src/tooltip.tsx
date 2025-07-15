import React, { useState, useEffect } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import './index.css';
import { useStorage } from './hooks/useStorage';
import type { DictionaryResult, ScraperResponse } from './types/tooltip';
import type { AnkiNote, AnkiFieldMappings } from './types/anki';

type TooltipPayload = {
  results: ScraperResponse;
  contextSentence: string;
};

const DictionaryResultCard: React.FC<{ result: DictionaryResult; contextSentence: string }> = ({ result, contextSentence }) => {
  const { settings, isLoading: isLoadingSettings } = useStorage();
  const [isAdding, setIsAdding] = useState(false);
  const [selectedAudioUrl, setSelectedAudioUrl] = useState<string | undefined>(
    result.audios.find(a => a.region === 'UK')?.url || result.audios[0]?.url
  );

  const handleAddNote = async () => {
    if (!settings) {
      alert('Error: No se pudo cargar la configuración.');
      return;
    }
    setIsAdding(true);

    const { ankiFieldMappings: mappings, ankiAllowDuplicates, ankiTags, selectedDeck, selectedAnkiModel } = settings;
    
    const richContent = result.definitions.map(d => 
      `<div style="margin-bottom: 12px; font-family: Arial, sans-serif; text-align: left;">
         <ul style="margin: 0; padding-left: 8px; list-style-type: '• '; color: #4A5568;">
           ${d.examples.map(ex => 
             `<li style="margin-bottom: 6px; padding-left: 4px;">
                <span style="display: block; color: #2D3748; font-size: 15px; line-height: 1.4;">${ex.original}</span>
                <span style="display: block; color: #718096; font-style: italic; font-size: 15px; line-height: 1.4;">${ex.translation}</span>
              </li>`
           ).join('')}
         </ul>
       </div>`
    ).join('<hr style="border: none; border-top: 1px solid #e2e8f0; margin: 12px 0;">');

    const availableData = {
      expression: result.word,
      pronunciation: result.phonetic,
      definition: result.definitions[0]?.translation || '',
      note: contextSentence,
      extraInfo: result.partOfSpeech,
      url: `https://dictionary.cambridge.org/dictionary/english-spanish/${result.word}`,
      picture: richContent, 
    };

    // 3. Mapeamos los datos a los campos de Anki
    const fields: { [key: string]: string } = {};
    for (const key in mappings) {
      const fieldKey = key as keyof AnkiFieldMappings;
      const ankiFieldName = mappings[fieldKey];
      
      if (ankiFieldName && Object.prototype.hasOwnProperty.call(availableData, fieldKey)) {
        const value = availableData[fieldKey as keyof typeof availableData];
        if (value) {
          fields[ankiFieldName] = value;
        }
      }
    }

    const note: AnkiNote = {
      deckName: selectedDeck,
      modelName: selectedAnkiModel,
      fields,
      options: {
        allowDuplicate: ankiAllowDuplicates,
        duplicateScope: "deck",
        duplicateScopeOptions: {
          deckName: selectedDeck, 
          checkChildren: false,
          checkAllModels: false
        }
      },
      tags: ankiTags,
    };

    if (selectedAudioUrl && mappings.audio) {
      note.audio = [{
        url: selectedAudioUrl,
        filename: `ankiwordflow_${result.word.replace(/ /g, '_')}_${Date.now()}.mp3`,
        fields: [mappings.audio],
      }];
    }

    try {
      const response = await chrome.runtime.sendMessage({ type: 'ANKI_ADD_NOTE', note });
      if (response?.error) {
        alert(`Error de AnkiConnect: ${response.error}`);
      } else {
        alert(`¡Nota para "${result.word}" guardada con éxito!`);
      }
    } catch (error) {
      alert(`Error de comunicación: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setIsAdding(false);
    }
  };

  const AudioButton: React.FC<{ region: string; url: string; isSelected: boolean; onSelect: () => void; }> = ({ region, url, isSelected, onSelect }) => {
    const playAudio = (e: React.MouseEvent) => {
      e.stopPropagation();
      new Audio(url).play();
      onSelect();
    };
    return (
      <button onClick={playAudio} className={`px-2 py-1 text-xs border rounded-md ${isSelected ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}>
        {region}
      </button>
    );
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-xl border border-gray-200 text-black max-w-sm flex flex-col gap-3">
      <header className="flex justify-between items-start">
        <div>
          <span className="font-bold text-xl text-blue-700">{result.word}</span>
          <span className="text-gray-500 ml-2">{result.phonetic}</span>
          <span className="italic text-gray-600 ml-2">{result.partOfSpeech}</span>
        </div>
        <div className="flex gap-2 flex-shrink-0">
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
        <button onClick={handleAddNote} disabled={isAdding || isLoadingSettings} className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400">
          {isAdding ? 'Añadiendo...' : 'Añadir a Anki'}
        </button>
      </footer>
    </div>
  );
};

export const TooltipApp: React.FC = () => {
  const [payload, setPayload] = useState<TooltipPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    window.parent.postMessage({ type: 'TOOLTIP_READY' }, '*');
    const handleMessage = (event: MessageEvent<TooltipPayload>) => {
      if (event.data && Array.isArray(event.data.results)) {
        setPayload(event.data);
        setIsLoading(false);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  if (isLoading) return <div className="p-4 text-sm text-center text-gray-500">Buscando...</div>;
  if (!payload || payload.results.length === 0) return <div className="p-4 text-sm text-center text-red-500">No se encontraron resultados.</div>;

  return (
    <div className="flex flex-col gap-4 p-2 bg-transparent">
      {payload.results.map((result, index) => (
        <DictionaryResultCard key={index} result={result} contextSentence={payload.contextSentence} />
      ))}
    </div>
  );
};

const container = document.getElementById('root');
if (container) {
  const root: Root = createRoot(container);
  root.render(<React.StrictMode><TooltipApp /></React.StrictMode>);
}