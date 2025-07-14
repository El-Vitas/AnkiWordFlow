import React from 'react';
import { Toggle } from '../../../common/components/Toggle';
import { useStorage } from '../../../hooks/useStorage';

// 👇 1. Definimos la interfaz de props
interface DictionaryTableProps {
  onSettingsChange: () => void;
}

const dictionaries = [
    { id: 'dees_larousse', name: 'Alemán -> Español | Larousse' },
    { id: 'dede_dwds', name: 'Alemán -> Alemán | DWDS' },
    { id: 'enes_cambridge', name: 'Inglés -> Español | Cambridge' },
    { id: 'esen_collins', name: 'Español -> Inglés | Collins' },
    { id: 'fren_cambridge', name: 'Francés -> Inglés | Cambridge' },
];

// 👇 2. Usamos la interfaz
export const DictionaryTable: React.FC<DictionaryTableProps> = ({ onSettingsChange }) => {
    const { settings, updateSetting, isLoading } = useStorage();

    if (isLoading) return <div>Cargando diccionarios...</div>;

    const handleToggle = (dictionaryId: string, newCheckedState: boolean) => {
        const newActiveDictionaries = {
            ...settings.activeDictionaries,
            [dictionaryId]: newCheckedState,
        };
        updateSetting('activeDictionaries', newActiveDictionaries);
        onSettingsChange(); // 3. Notificamos el cambio
    };

    return (
        <div className="space-y-3">
            {dictionaries.map(dict => (
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