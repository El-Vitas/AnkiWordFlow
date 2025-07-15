import React from 'react';
import { Toggle } from '../../../common/components/Toggle';
import { Select } from '../../../common/components/Select';
import { useStorage } from '../../../hooks/useStorage';
import { AutoSelectKey, type ExtensionSettings } from '../../../types/storage';

interface ActivationControlsProps {
  onSettingsChange?: () => void;
}

const keyOptions = Object.values(AutoSelectKey).map(key => ({ 
  value: key, 
  label: key.charAt(0).toUpperCase() + key.slice(1) 
}));

export const ActivationControls: React.FC<ActivationControlsProps> = ({ onSettingsChange }) => {
  const { settings, updateSetting, isLoading, error } = useStorage();

  if (isLoading) return <div>Cargando...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  const handleChange = <K extends keyof ExtensionSettings>(key: K, value: ExtensionSettings[K]) => {
    updateSetting(key, value);
    onSettingsChange?.(); 
  };

  return (
    <div className="p-4 bg-white rounded-lg border border-gray-200 space-y-4">
      <Toggle 
        label="Activar Extensión" 
        checked={settings.isExtensionActive} 
        onChange={(value) => handleChange('isExtensionActive', value)} 
      />
      <Toggle 
        label="Selección con Mouse" 
        checked={settings.isMouseSelectionActive} 
        onChange={(value) => handleChange('isMouseSelectionActive', value)} 
      />
      <hr className="border-gray-200" />
      <Select 
        label="AutoSel. con tecla" 
        options={keyOptions} 
        value={settings.autoSelectKey} 
        onChange={(value) => handleChange('autoSelectKey', value as AutoSelectKey)} 
      />
    </div>
  );
};