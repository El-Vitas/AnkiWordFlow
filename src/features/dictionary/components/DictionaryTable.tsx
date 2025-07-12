import { Toggle } from '../../../common/components/Toggle';
import { useStorage } from '../../../hooks/useStorage';

const dictionaries = [
    { id: 'dees_larousse', name: 'Alemán -> Español | Larousse' },
    { id: 'dede_dwds', name: 'Alemán -> Alemán | DWDS' },
    { id: 'enes_cambridge', name: 'Inglés -> Español | Cambridge' },
    { id: 'esen_collins', name: 'Español -> Inglés | Collins' },
    { id: 'fren_cambridge', name: 'Francés -> Inglés | Cambridge' },
];

export function DictionaryTable() {
	const { settings, updateSetting, isLoading, error } = useStorage();

	if (isLoading) {
		return <div>Cargando...</div>;
	}

	if (error) {
		return <div className="text-red-600">Error: {error}</div>;
	}

    // Función para manejar el cambio de un solo diccionario
    const handleToggle = (dictionaryId: string, newCheckedState: boolean) => {
        // Creamos una copia del objeto de diccionarios y actualizamos solo el que cambió
        const newActiveDictionaries = {
            ...settings.activeDictionaries,
            [dictionaryId]: newCheckedState,
        };
        // Guardamos el objeto completo de vuelta en el storage
        updateSetting('activeDictionaries', newActiveDictionaries);
    };

    return (
        <div className="space-y-3">
            {dictionaries.map(dict => (
                <div key={dict.id} className="p-3 bg-gray-50 rounded-md border">
                    {/* El Toggle ahora es controlado por el estado de 'activeDictionaries' */}
                    <Toggle
                        label={dict.name}
                        checked={settings.activeDictionaries[dict.id] ?? false}
                        onChange={(newCheckedState) => handleToggle(dict.id, newCheckedState)}
                    />
                </div>
            ))}
        </div>
    );
}