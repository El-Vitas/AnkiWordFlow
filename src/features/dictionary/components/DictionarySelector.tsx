import React from 'react';
import { Select } from '../../../common/components/Select';
import { useStorage } from '../../../hooks/useStorage';
import { availableDictionaries } from '../../../lib/dictionaries'; 

interface DictionarySelectorProps {
  onSettingsChange?: () => void;
}

export const DictionarySelector: React.FC<DictionarySelectorProps> = ({ onSettingsChange }) => {
  const { settings, updateSetting, isLoading } = useStorage();

  if (isLoading) return <div>Cargando...</div>;

  const activeDictionaryOptions = availableDictionaries
    .filter(dict => settings.activeDictionaries[dict.id])
    .map(dict => ({ value: dict.id, label: dict.name }));

  const handleChange = (value: string) => {
    updateSetting('mainDictionary', value);
    onSettingsChange?.();
  };

  return (
    <div className="p-4 bg-white rounded-lg border border-gray-200">
      <Select
        label="Diccionario"
        options={activeDictionaryOptions}
        value={settings.mainDictionary}
        onChange={handleChange}
      />
    </div>
  );
};