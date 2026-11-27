import { Select } from '../../../common/components/Select';
import { useStorage } from '../../../hooks/useStorage';
import { availableDictionaries } from '../../../lib/dictionaries';
import { t } from '../../../lib/i18n';

export const DictionarySelector = () => {
  const { settings, updateSetting, isLoading } = useStorage();
  if (isLoading) return null;

  const options = availableDictionaries
    .filter((dictionary) => settings.activeDictionaries[dictionary.id])
    .map((dictionary) => ({ value: dictionary.id, label: t(dictionary.nameKey) }));

  return (
    <div className="p-4 bg-white rounded-lg border border-gray-200">
      {options.length > 0 ? (
        <Select label={t('dictionary')} options={options} value={settings.mainDictionary} onChange={(value) => void updateSetting('mainDictionary', value)} />
      ) : (
        <p className="text-sm text-gray-600">{t('noDictionary')}</p>
      )}
    </div>
  );
};
