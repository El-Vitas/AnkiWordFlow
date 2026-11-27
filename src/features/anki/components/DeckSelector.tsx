import { Select } from '../../../common/components/Select';
import { useStorage } from '../../../hooks/useStorage';
import { t } from '../../../lib/i18n';
import { AnkiExportMode } from '../../../types/storage';
import { useAnkiCollection } from '../hooks/useAnkiCollection';

export const DeckSelector = () => {
  const { settings, updateSetting, isLoading } = useStorage();
  const isExporting = !isLoading && settings.ankiExportMode === AnkiExportMode.AnkiConnect;
  const anki = useAnkiCollection(isExporting);

  if (!isExporting) return null;

  return (
    <div className="p-4 bg-white rounded-lg border border-gray-200">
      {anki.phase === 'loading' && <p className="text-sm text-gray-500">{t('loadingDecks')}</p>}
      {anki.phase === 'error' && <p className="text-sm text-red-600">{anki.message}</p>}
      {anki.phase === 'ready' && (
        <Select
          label={t('ankiDeck')}
          options={anki.collection.decks.map((deck) => ({ value: deck, label: deck }))}
          value={settings.selectedDeck}
          onChange={(value) => void updateSetting('selectedDeck', value)}
        />
      )}
    </div>
  );
};
