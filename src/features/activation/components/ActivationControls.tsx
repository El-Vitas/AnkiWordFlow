import { Toggle } from "../../../common/components/Toggle";
import { Select } from "../../../common/components/Select";
import { useStorage } from "../../../hooks/useStorage";
import { AutoSelectKey } from "../../../types/storage"; // 👈 1. Importa el enum

// 2. Las opciones ahora usan el enum para sus valores, haciendo el código más seguro.
const keyOptions = [
	{ value: AutoSelectKey.Off, label: "Off" },
	{ value: AutoSelectKey.Alt, label: "Alt" },
	{ value: AutoSelectKey.Shift, label: "Shift" },
	{ value: AutoSelectKey.Ctrl, label: "Ctrl" },
];

export function ActivationControls() {
	const { settings, updateSetting, isLoading, error } = useStorage();

	if (isLoading) {
		return <div>Cargando...</div>;
	}

	if (error) {
		return <div className="text-red-600">Error: {error}</div>;
	}

	return (
		<div className="space-y-4">
			<Toggle
				label="Activar Extensión"
				checked={settings.isExtensionActive}
				onChange={(value) => updateSetting("isExtensionActive", value)}
			/>
			<Toggle
				label="Selección con Mouse"
				checked={settings.isMouseSelectionActive}
				onChange={(value) => updateSetting("isMouseSelectionActive", value)}
			/>
			<hr className="border-gray-200" />
			<Select
				label="AutoSel. con tecla"
				options={keyOptions}
				value={settings.autoSelectKey}
				// 3. El valor del select es un string, lo convertimos de vuelta al tipo enum.
				onChange={(value) =>
					updateSetting("autoSelectKey", value as AutoSelectKey)
				}
			/>
		</div>
	);
}
