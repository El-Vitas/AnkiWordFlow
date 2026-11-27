import { Toggle } from '../../../common/components/Toggle';
import { useStorage } from '../../../hooks/useStorage';
import { availableDictionaries } from '../../../lib/dictionaries';
import { t } from '../../../lib/i18n';

interface DictionaryTableProps {
  onSettingsChange: () => void;
}

export const DictionaryTable = ({ onSettingsChange }: DictionaryTableProps) => {
  const { settings, updateSetting, isLoading } = useStorage();
  if (isLoading) return <p className="text-sm text-gray-500">{t('loading')}</p>;

  const toggle = (dictionaryId: string, active: boolean) => {
    const activeDictionaries = { ...settings.activeDictionaries, [dictionaryId]: active };
    void updateSetting('activeDictionaries', activeDictionaries);
    if (!active && settings.mainDictionary === dictionaryId) {
      const nextActive = availableDictionaries.find((dictionary) => activeDictionaries[dictionary.id]);
      void updateSetting('mainDictionary', nextActive?.id ?? '');
    }
    if (active && !settings.activeDictionaries[settings.mainDictionary]) void updateSetting('mainDictionary', dictionaryId);
    onSettingsChange();
  };

  return (
    <div className="space-y-3">
      {availableDictionaries.map((dictionary) => (
        <div key={dictionary.id} className="p-3 bg-gray-50 rounded-md border border-gray-200">
          <Toggle
            label={t(dictionary.nameKey)}
            checked={settings.activeDictionaries[dictionary.id] ?? false}
            onChange={(active) => toggle(dictionary.id, active)}
          />
        </div>
      ))}
    </div>
  );
};
