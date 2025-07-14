import React from 'react';
import { ActivationControls } from '../features/activation/components/ActivationControls';
import { DictionarySelector } from '../features/dictionary/components/DictionarySelector';
import { DeckSelector } from '../features/anki/components/DeckSelector';

const SettingsIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2l-.15.08a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1 0-2l.15-.08a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const ToolbarPopup: React.FC = () => {
  const openOptionsPage = () => {
    chrome.runtime.openOptionsPage();
  };

  return (
    <div className="w-80 p-4 bg-gray-50 font-sans">
      <header className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <img src="/vite.svg" alt="AnkiWordFlow Logo" className="w-6 h-6" />
          <h1 className="text-lg font-bold text-gray-800">AnkiWordFlow</h1>
        </div>
        <button
          onClick={openOptionsPage}
          className="p-2 rounded-full hover:bg-gray-200 transition-colors"
          title="Abrir configuración"
        >
          <SettingsIcon />
        </button>
      </header>

      <main className="space-y-4">
        <ActivationControls />
        <DictionarySelector />
        <DeckSelector />
      </main>

      <footer className="text-center mt-4">
        <p className="text-xs text-gray-400">v1.0.0</p>
      </footer>
    </div>
  );
};