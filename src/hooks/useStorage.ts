import { useState, useEffect } from 'react';
import { type ExtensionSettings, defaultSettings } from '../types/storage';

type SettingsUpdater = <K extends keyof ExtensionSettings>(
  key: K,
  value: ExtensionSettings[K]
) => Promise<void>;

export function useStorage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<ExtensionSettings>(defaultSettings);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const result = await chrome.storage.local.get(defaultSettings);
        setSettings(result as ExtensionSettings);
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'Ocurrió un error desconocido.';
        console.error("Error al cargar la configuración:", e);
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();

    const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }, areaName: string) => {
      if (areaName !== 'local') {
        return;
      }

      const newValues = Object.entries(changes).reduce((acc, [key, { newValue }]) => {
        if (Object.keys(defaultSettings).includes(key)) {
          acc[key as keyof ExtensionSettings] = newValue;
        }
        return acc;
      }, {} as Partial<ExtensionSettings>);

      if (Object.keys(newValues).length > 0) {
        setSettings((prevSettings) => ({ ...prevSettings, ...newValues }));
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);

    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, []);

  const updateSetting: SettingsUpdater = async (key, value) => {
    setSettings((prevSettings) => ({
      ...prevSettings,
      [key]: value,
    }));

    try {
      await chrome.storage.local.set({ [key]: value });
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Ocurrió un error desconocido.';
      console.error("Error al guardar la configuración:", e);
      setError(errorMessage);
    }
  };

  return { settings, updateSetting, isLoading, error };
}