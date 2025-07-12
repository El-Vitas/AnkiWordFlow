import { Select } from "../../../common/components/Select";
import { useStorage } from "../../../hooks/useStorage";
import { AnkiExportMode } from "../../../types/storage";

// Actualizamos las opciones para que usen el enum
const exportOptions = [
    { value: AnkiExportMode.None, label: 'None' },
    { value: AnkiExportMode.AnkiConnect, label: 'AnkiConnect' },
    { value: AnkiExportMode.AnkiWeb, label: 'AnkiWeb (Próximamente)' },
];

export function AnkiConnect() {
	const { settings, updateSetting, isLoading, error } = useStorage();

	if (isLoading) {
		return <div>Cargando...</div>;
	}

	if (error) {
		return <div className="text-red-600">Error: {error}</div>;
	}

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 items-center gap-4">
                {/* Ahora el Select recibe 'value' y 'onChange' del hook */}
                <Select
                    label="Data Export"
                    options={exportOptions}
                    value={settings.ankiExportMode}
                    onChange={(value) => updateSetting('ankiExportMode', value as AnkiExportMode)}
                />
                <div className="flex items-center space-x-2 justify-self-end">
                    <span className="text-yellow-600 font-semibold">Conectando...</span>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                </div>
            </div>
        </div>
    )
}