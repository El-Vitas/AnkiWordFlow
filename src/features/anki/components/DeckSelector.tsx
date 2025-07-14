import React, { useState, useEffect } from 'react';
import { useStorage } from '../../../hooks/useStorage';
import { Select } from '../../../common/components/Select';

interface DeckSelectorProps {
  onSettingsChange?: () => void;
}

export const DeckSelector: React.FC<DeckSelectorProps> = ({ onSettingsChange }) => {
  const [decks, setDecks] = useState<string[]>([]);
  const [isLoadingDecks, setIsLoadingDecks] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const { settings, updateSetting, isLoading: isLoadingSettings } = useStorage();

  useEffect(() => {
    const fetchDeckNames = async () => {
      try {
        const response = await chrome.runtime.sendMessage({ type: 'ANKI_GET_DECK_NAMES' });
        if (response.error) throw new Error(response.error);
        setDecks(response);
        setError(null);
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'Error desconocido';
        setError(errorMessage);
        setDecks([]);
      } finally {
        setIsLoadingDecks(false);
      }
    };
    fetchDeckNames();
  }, []);

  const handleChange = (newValue: string) => {
    updateSetting('selectedDeck', newValue);
    onSettingsChange?.();
  };

  if (isLoadingSettings || isLoadingDecks) {
    return <div className="p-2 text-sm text-gray-500">Cargando mazos...</div>;
  }

  if (error) {
    return <div className="p-2 text-sm text-red-600" title={error}>Error al conectar con Anki.</div>;
  }

  return (
    <div className="p-4 bg-white rounded-lg border border-gray-200">
      <Select
        label="Mazo de Anki"
        options={decks.map(deck => ({ value: deck, label: deck }))}
        value={settings.selectedDeck}
        onChange={handleChange}
      />
    </div>
  );
};