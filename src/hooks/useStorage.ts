import { useEffect, useState } from 'react';
import { t } from '../lib/i18n';
import { loadSettings } from '../lib/settings';
import { defaultSettings, type ExtensionSettings } from '../types/storage';

type SettingsUpdater = <K extends keyof ExtensionSettings>(key: K, value: ExtensionSettings[K]) => Promise<void>;

/** The extension settings, kept in sync with chrome.storage across the popup, options and tooltip. */
export const useStorage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<ExtensionSettings>(defaultSettings);

  useEffect(() => {
    const refresh = () =>
      loadSettings()
        .then((loaded) => {
          setSettings(loaded);
          setError(null);
        })
        .catch(() => setError(t('settingsLoadFailed')))
        .finally(() => setIsLoading(false));

    void refresh();
    const onChanged = (_changes: Record<string, chrome.storage.StorageChange>, area: string) => {
      if (area === 'local') void refresh();
    };
    chrome.storage.onChanged.addListener(onChanged);
    return () => chrome.storage.onChanged.removeListener(onChanged);
  }, []);

  const updateSetting: SettingsUpdater = async (key, value) => {
    setSettings((previous) => ({ ...previous, [key]: value }));
    try {
      await chrome.storage.local.set({ [key]: value });
    } catch {
      setError(t('settingsSaveFailed'));
    }
  };

  return { settings, updateSetting, isLoading, error };
};
