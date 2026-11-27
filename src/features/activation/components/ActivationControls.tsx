import { Select } from '../../../common/components/Select';
import { Toggle } from '../../../common/components/Toggle';
import { useStorage } from '../../../hooks/useStorage';
import { t } from '../../../lib/i18n';
import { AutoSelectKey, type ExtensionSettings } from '../../../types/storage';

interface ActivationControlsProps {
  onSettingsChange?: () => void;
}

const KEY_LABELS: Record<AutoSelectKey, string> = {
  off: 'keyOff',
  alt: 'keyAlt',
  shift: 'keyShift',
  ctrl: 'keyCtrl',
};

export const ActivationControls = ({ onSettingsChange }: ActivationControlsProps) => {
  const { settings, updateSetting, isLoading, error } = useStorage();

  if (isLoading) return <p className="text-sm text-gray-500">{t('loading')}</p>;
  if (error) return <p className="text-sm text-red-600">{error}</p>;

  const change = <K extends keyof ExtensionSettings>(key: K, value: ExtensionSettings[K]) => {
    void updateSetting(key, value);
    onSettingsChange?.();
  };

  return (
    <div className="p-4 bg-white rounded-lg border border-gray-200 space-y-4">
      <Toggle label={t('extensionActive')} checked={settings.isExtensionActive} onChange={(value) => change('isExtensionActive', value)} />
      <Toggle
        label={t('lookUpOnSelection')}
        checked={settings.isMouseSelectionActive}
        onChange={(value) => change('isMouseSelectionActive', value)}
      />
      <hr className="border-gray-200" />
      <Select
        label={t('lookUpWordUnderMouse')}
        options={Object.values(AutoSelectKey).map((key) => ({ value: key, label: t(KEY_LABELS[key]) }))}
        value={settings.autoSelectKey}
        onChange={(value) => change('autoSelectKey', value as AutoSelectKey)}
      />
    </div>
  );
};
