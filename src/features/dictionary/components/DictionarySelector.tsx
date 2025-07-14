import React from 'react';
import { Select } from '../../../common/components/Select';
import { useStorage } from '../../../hooks/useStorage';

interface DictionarySelectorProps {
  onSettingsChange?: () => void;
}

const dictionaryOptions = [
  { value: 'enes_cambridge', label: 'Inglés -> Español' },
  { value: 'es_rae', label: 'Español (RAE)' },
  { value: 'fres_larousse', label: 'Francés -> Español' },
];

export const DictionarySelector: React.FC<DictionarySelectorProps> = ({ onSettingsChange }) => {
  const { settings, updateSetting, isLoading } = useStorage();

  if (isLoading) return <div>Cargando...</div>;

  const handleChange = (value: string) => {
    updateSetting('mainDictionary', value);
    onSettingsChange?.();
  };

  return (
    <div className="p-4 bg-white rounded-lg border border-gray-200">
      <Select
        label="Diccionario"
        options={dictionaryOptions}
        value={settings.mainDictionary}
        onChange={handleChange}
      />
    </div>
  );
};