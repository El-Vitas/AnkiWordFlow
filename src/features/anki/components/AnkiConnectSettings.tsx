import React, { useState, useEffect } from 'react';
import { useStorage } from '../../../hooks/useStorage';
import { Select } from '../../../common/components/Select';
import { AnkiExportMode, type ExtensionSettings } from '../../../types/storage';
import type { AnkiFieldMappings } from '../../../types/anki';

// 👇 1. Definimos la interfaz de props
interface AnkiConnectSettingsProps {
  onSettingsChange: () => void;
}

// 👇 2. Usamos la interfaz
export const AnkiConnectSettings: React.FC<AnkiConnectSettingsProps> = ({ onSettingsChange }) => {
  const { settings, updateSetting, isLoading: isLoadingSettings } = useStorage();

  const [ankiDecks, setAnkiDecks] = useState<string[]>([]);
  const [ankiModels, setAnkiModels] = useState<string[]>([]);
  const [ankiFields, setAnkiFields] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [ankiVersion, setAnkiVersion] = useState<number | null>(null);

  // 👇 3. Función centralizada para actualizar y notificar
  const handleChange = <K extends keyof ExtensionSettings>(key: K, value: ExtensionSettings[K]) => {
    updateSetting(key, value);
    onSettingsChange();
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      if (settings.ankiExportMode !== AnkiExportMode.AnkiConnect) return;
      try {
        const [versionRes, decksRes, modelsRes] = await Promise.all([
          chrome.runtime.sendMessage({ type: 'ANKI_GET_VERSION' }),
          chrome.runtime.sendMessage({ type: 'ANKI_GET_DECK_NAMES' }),
          chrome.runtime.sendMessage({ type: 'ANKI_GET_MODEL_NAMES' }),
        ]);

        if (versionRes?.error) throw new Error(versionRes.error);
        setAnkiVersion(versionRes);

        if (decksRes?.error) throw new Error(decksRes.error);
        setAnkiDecks(decksRes);

        if (modelsRes?.error) throw new Error(modelsRes.error);
        setAnkiModels(modelsRes);
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error al conectar con Anki.');
      }
    };
    fetchInitialData();
  }, [settings.ankiExportMode]);

  useEffect(() => {
    if (!settings.selectedAnkiModel || settings.ankiExportMode !== AnkiExportMode.AnkiConnect) return;
    
    const fetchFieldNames = async () => {
      try {
        const fieldsRes = await chrome.runtime.sendMessage({
          type: 'ANKI_GET_MODEL_FIELD_NAMES',
          modelName: settings.selectedAnkiModel,
        });
        if (fieldsRes.error) throw new Error(fieldsRes.error);
        setAnkiFields(fieldsRes);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error al obtener campos.');
      }
    };
    fetchFieldNames();
  }, [settings.selectedAnkiModel, settings.ankiExportMode]);

  const handleMappingChange = (fieldToMap: keyof AnkiFieldMappings, ankiField: string) => {
    const newMappings = {
      ...settings.ankiFieldMappings,
      [fieldToMap]: ankiField,
    };
    handleChange('ankiFieldMappings', newMappings);
  };

  if (isLoadingSettings) return <div>Cargando configuración...</div>;

  const fieldOptions = ankiFields.map(f => ({ value: f, label: f }));
  const ankiFieldMappingKeys = Object.keys(settings.ankiFieldMappings) as (keyof AnkiFieldMappings)[];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4 items-center p-3 bg-gray-50 rounded-md border">
        <Select label="Data Export" options={Object.values(AnkiExportMode).map(m => ({ value: m, label: m }))} value={settings.ankiExportMode} onChange={val => handleChange('ankiExportMode', val as AnkiExportMode)} />
        {settings.ankiExportMode === AnkiExportMode.AnkiConnect && (
          <div className={`col-span-2 text-sm font-semibold ${error ? 'text-red-500' : 'text-green-600'}`}>
            {error ? `Error: ${error}` : `Conectado: ver ${ankiVersion}`}
          </div>
        )}
      </div>

      {settings.ankiExportMode === AnkiExportMode.AnkiConnect && !error && (
        <div className="mt-4 space-y-6">
          <div className="grid grid-cols-2 gap-x-8 gap-y-4 p-3 bg-gray-50 rounded-md border">
            <Select label="Sel. Mazo" options={ankiDecks.map(d => ({ value: d, label: d }))} value={settings.selectedDeck} onChange={val => handleChange('selectedDeck', val)} />
            <Select label="Formato" options={ankiModels.map(m => ({ value: m, label: m }))} value={settings.selectedAnkiModel} onChange={val => handleChange('selectedAnkiModel', val)} />
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-4 p-3 bg-gray-50 rounded-md border">
            {ankiFieldMappingKeys.map(key => (
              <Select key={key} label={key.charAt(0).toUpperCase() + key.slice(1)} options={fieldOptions} value={settings.ankiFieldMappings[key]} onChange={val => handleMappingChange(key, val)} />
            ))}
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-4 p-3 bg-gray-50 rounded-md border">
            <div>
              <label className="block text-sm font-medium text-gray-700">Note Tags</label>
              <input type="text" className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" value={settings.ankiTags.join(', ')} onChange={e => handleChange('ankiTags', e.target.value.split(',').map(tag => tag.trim()))} />
            </div>
            <Select label="Tarj. duplicada" options={[{ value: 'true', label: 'Permitido' }, { value: 'false', label: 'No permitido' }]} value={String(settings.ankiAllowDuplicates)} onChange={val => handleChange('ankiAllowDuplicates', val === 'true')} />
          </div>
        </div>
      )}
    </div>
  );
};