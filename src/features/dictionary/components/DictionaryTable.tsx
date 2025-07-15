import React from 'react';
import { Toggle } from '../../../common/components/Toggle';
import { useStorage } from '../../../hooks/useStorage';
import { availableDictionaries } from '../../../lib/dictionaries'; 

interface DictionaryTableProps {
  onSettingsChange: () => void;
}

export const DictionaryTable: React.FC<DictionaryTableProps> = ({ onSettingsChange }) => {
  const { settings, updateSetting, isLoading } = useStorage();

  if (isLoading) return <div>Cargando diccionarios...</div>;

  const handleToggle = (dictionaryId: string, newCheckedState: boolean) => {
    const newActiveDictionaries = {
      ...settings.activeDictionaries,
      [dictionaryId]: newCheckedState,
    };

    updateSetting('activeDictionaries', newActiveDictionaries);

    if (!newCheckedState && settings.mainDictionary === dictionaryId) {
      const firstActiveId = Object.keys(newActiveDictionaries).find(
        (key) => newActiveDictionaries[key]
      );
      updateSetting('mainDictionary', firstActiveId || '');
    }
    
    onSettingsChange();
  };

  return (
    <div className="space-y-3">
      {availableDictionaries.map(dict => (
        <div key={dict.id} className="p-3 bg-gray-50 rounded-md border">
          <Toggle
            label={dict.name}
            checked={settings.activeDictionaries[dict.id] ?? false}
            onChange={(newCheckedState) => handleToggle(dict.id, newCheckedState)}
          />
        </div>
      ))}
    </div>
  );
};