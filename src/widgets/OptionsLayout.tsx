import React, { useState } from 'react';
import { Card } from '../common/components/Card';
import { ActivationControls } from '../features/activation/components/ActivationControls';
import { DictionaryTable } from '../features/dictionary/components/DictionaryTable';
import { AnkiConnectSettings } from '../features/anki/components/AnkiConnectSettings';
import { SaveNotification } from '../common/components/SaveNotification';

const TABS = ['General', 'Diccionarios', 'Servicios'];

export const OptionsLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [showSaveNotification, setShowSaveNotification] = useState(false);

  const triggerSaveNotification = () => {
    setShowSaveNotification(true);
    setTimeout(() => setShowSaveNotification(false), 2000);
  };

  const handleClose = () => {
    window.close();
  };

  return (
    <div className="w-full bg-white font-sans text-gray-800">
      <nav className="flex border-b border-gray-200 bg-gray-50">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 text-sm font-semibold transition-colors focus:outline-none ${activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600 bg-white' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {tab}
          </button>
        ))}
      </nav>

      <main className="p-6 min-h-[400px]">
        {activeTab === 'General' && <ActivationControls onSettingsChange={triggerSaveNotification} />}
        {activeTab === 'Diccionarios' && <DictionaryTable onSettingsChange={triggerSaveNotification} />}
        {activeTab === 'Servicios' && (
          <Card title="Opciones de AnkiConnect">
            <AnkiConnectSettings onSettingsChange={triggerSaveNotification} />
          </Card>
        )}
      </main>

      <footer className="flex justify-end space-x-3 p-4 bg-gray-50 border-t border-gray-200">
        <button
          onClick={handleClose}
          className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
        >
          Cerrar
        </button>
      </footer>
      
      <SaveNotification show={showSaveNotification} message="Guardado" />
    </div>
  );
};