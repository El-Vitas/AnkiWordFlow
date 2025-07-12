// src/features/dictionary/components/DictionarySelector.tsx
import { Select } from '../../../common/components/Select';
import { useStorage } from '../../../hooks/useStorage'; // 👈 1. Importa el hook

const dictionaryOptions = [
  { value: 'enes_cambridge', label: 'Inglés -> Español' },
  { value: 'es_rae', label: 'Español (RAE)' },
  { value: 'fres_larousse', label: 'Francés -> Español' },
];

export function DictionarySelector() {
	const { settings, updateSetting, isLoading, error } = useStorage();

	if (isLoading) {
		return <div>Cargando...</div>;
	}

	if (error) {
		return <div className="text-red-600">Error: {error}</div>;
	}

  return (
    <div className="p-4 bg-white rounded-lg border border-gray-200">
      {/* 3. Pasa 'value' y 'onChange' al componente Select */}
      <Select
        label="Diccionario"
        options={dictionaryOptions}
        value={settings.mainDictionary}
        onChange={(value) => updateSetting('mainDictionary', value)}
      />
    </div>
  );
}