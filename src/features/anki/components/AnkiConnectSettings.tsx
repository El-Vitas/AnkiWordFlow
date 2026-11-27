import { useState } from 'react';
import { Select } from '../../../common/components/Select';
import { Toggle } from '../../../common/components/Toggle';
import { useStorage } from '../../../hooks/useStorage';
import { t } from '../../../lib/i18n';
import type { AnkiFieldMappings } from '../../../types/anki';
import { AnkiExportMode, type ExtensionSettings } from '../../../types/storage';
import { useAnkiCollection, useModelFields } from '../hooks/useAnkiCollection';

interface AnkiConnectSettingsProps {
  onSettingsChange: () => void;
}

/** The order and label of each mappable piece of data in the settings. */
const MAPPING_LABELS: Record<keyof AnkiFieldMappings, string> = {
  expression: 'fieldExpression',
  pronunciation: 'fieldPronunciation',
  definition: 'fieldDefinition',
  definitions: 'fieldDefinitions',
  examples: 'fieldExamples',
  note: 'fieldContext',
  extraInfo: 'fieldPartOfSpeech',
  url: 'fieldUrl',
  audio: 'fieldAudio',
};

const parseTags = (text: string): string[] =>
  text
    .split(/[\s,]+/)
    .map((tag) => tag.trim())
    .filter(Boolean);

export const AnkiConnectSettings = ({ onSettingsChange }: AnkiConnectSettingsProps) => {
  const { settings, updateSetting, isLoading } = useStorage();
  const isExporting = !isLoading && settings.ankiExportMode === AnkiExportMode.AnkiConnect;
  const anki = useAnkiCollection(isExporting);
  const fields = useModelFields(settings.selectedAnkiModel, anki.phase === 'ready');
  const [tagsDraft, setTagsDraft] = useState<string | null>(null);

  if (isLoading) return <p className="text-sm text-gray-500">{t('loading')}</p>;

  const change = <K extends keyof ExtensionSettings>(key: K, value: ExtensionSettings[K]) => {
    void updateSetting(key, value);
    onSettingsChange();
  };
  const fieldOptions = fields.map((field) => ({ value: field, label: field }));

  return (
    <div className="space-y-4">
      <div className="p-3 bg-gray-50 rounded-md border border-gray-200 space-y-2">
        <Toggle
          label={t('exportToAnki')}
          checked={isExporting}
          onChange={(enabled) => change('ankiExportMode', enabled ? AnkiExportMode.AnkiConnect : AnkiExportMode.None)}
        />
        {isExporting && (
          <p role="status" className={`text-sm font-semibold ${anki.phase === 'error' ? 'text-red-600' : anki.phase === 'ready' ? 'text-green-700' : 'text-gray-500'}`}>
            {anki.phase === 'loading' && t('connecting')}
            {anki.phase === 'error' && anki.message}
            {anki.phase === 'ready' && t('connected', String(anki.collection.version))}
          </p>
        )}
      </div>

      {anki.phase === 'ready' && isExporting && (
        <>
          <div className="grid gap-3 p-3 bg-gray-50 rounded-md border border-gray-200">
            <Select
              label={t('ankiDeck')}
              options={anki.collection.decks.map((deck) => ({ value: deck, label: deck }))}
              value={settings.selectedDeck}
              onChange={(value) => change('selectedDeck', value)}
            />
            <Select
              label={t('noteType')}
              options={anki.collection.models.map((model) => ({ value: model, label: model }))}
              value={settings.selectedAnkiModel}
              onChange={(value) => change('selectedAnkiModel', value)}
            />
          </div>

          <fieldset className="grid gap-3 p-3 bg-gray-50 rounded-md border border-gray-200">
            <legend className="px-1 text-sm font-semibold text-gray-700">{t('fieldMappings')}</legend>
            {(Object.keys(MAPPING_LABELS) as (keyof AnkiFieldMappings)[]).map((key) => (
              <Select
                key={key}
                label={t(MAPPING_LABELS[key])}
                options={fieldOptions}
                emptyLabel={t('fieldNone')}
                value={settings.ankiFieldMappings[key]}
                onChange={(value) => change('ankiFieldMappings', { ...settings.ankiFieldMappings, [key]: value })}
              />
            ))}
          </fieldset>

          <div className="grid gap-3 p-3 bg-gray-50 rounded-md border border-gray-200">
            <label className="flex items-center justify-between gap-4 text-sm text-gray-700">
              {t('noteTags')}
              <input
                type="text"
                className="w-44 px-2 py-1 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={tagsDraft ?? settings.ankiTags.join(' ')}
                onChange={(event) => setTagsDraft(event.target.value)}
                onBlur={() => {
                  if (tagsDraft !== null) change('ankiTags', parseTags(tagsDraft));
                  setTagsDraft(null);
                }}
              />
            </label>
            <Toggle label={t('allowDuplicates')} checked={settings.ankiAllowDuplicates} onChange={(value) => change('ankiAllowDuplicates', value)} />
          </div>
        </>
      )}
    </div>
  );
};
