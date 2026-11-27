import { useRef, useState } from 'react';
import { Card } from '../common/components/Card';
import { SaveNotification } from '../common/components/SaveNotification';
import { ActivationControls } from '../features/activation/components/ActivationControls';
import { AnkiConnectSettings } from '../features/anki/components/AnkiConnectSettings';
import { DictionaryTable } from '../features/dictionary/components/DictionaryTable';
import { t } from '../lib/i18n';

const TABS = ['general', 'dictionaries', 'anki'] as const;
type Tab = (typeof TABS)[number];

const TAB_LABELS: Record<Tab, string> = { general: 'tabGeneral', dictionaries: 'tabDictionaries', anki: 'tabAnki' };
const NOTIFICATION_MS = 2000;

export const OptionsLayout = () => {
  const [activeTab, setActiveTab] = useState<Tab>('general');
  const [showSaved, setShowSaved] = useState(false);
  const hideTimer = useRef<number | undefined>(undefined);

  const notifySaved = () => {
    setShowSaved(true);
    window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => setShowSaved(false), NOTIFICATION_MS);
  };

  return (
    <div className="min-h-screen w-full bg-white font-sans text-gray-800">
      <div className="max-w-2xl mx-auto">
        <header className="flex items-center gap-2 px-6 pt-6 pb-4">
          <img src="/awfMain.png" alt="" className="w-7 h-7" />
          <h1 className="text-xl font-bold">{t('settingsTitle')}</h1>
        </header>
        <nav role="tablist" className="flex border-b border-gray-200 bg-gray-50">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={activeTab === tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600 bg-white' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {t(TAB_LABELS[tab])}
            </button>
          ))}
        </nav>

        <main className="p-6 min-h-[400px]">
          {activeTab === 'general' && <ActivationControls onSettingsChange={notifySaved} />}
          {activeTab === 'dictionaries' && <DictionaryTable onSettingsChange={notifySaved} />}
          {activeTab === 'anki' && (
            <Card title={t('ankiConnectSettings')}>
              <AnkiConnectSettings onSettingsChange={notifySaved} />
            </Card>
          )}
        </main>
      </div>
      <SaveNotification show={showSaved} message={t('saved')} />
    </div>
  );
};
