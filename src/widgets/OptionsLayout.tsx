// src/widgets/OptionsLayout.tsx
import { useState } from 'react';
import { ActivationControls } from '../features/activation/components/ActivationControls';
import { DictionaryTable } from '../features/dictionary/components/DictionaryTable';
import { AnkiConnect } from '../features/anki/components/AnkiConnect';

const TABS = ['General', 'Diccionarios', 'Servicios'];

export function OptionsLayout() {
  const [activeTab, setActiveTab] = useState(TABS[0]);

  return (
    <div className="w-full h-full flex flex-col bg-white font-sans text-gray-800 rounded-lg shadow-xl"> {/* Added rounded corners and shadow for a dialog-like appearance */}

      {/* 1. Cabecera: No se encoge */}
      <header className="flex-shrink-0 flex items-center space-x-3 p-4 border-b border-gray-200">
        <img src="/vite.svg" alt="Logo" className="w-7 h-7" />
        <h1 className="text-xl font-bold">Configuración</h1>
      </header>

      {/* 2. Navegación por Pestañas: No se encoge */}
      <nav className="flex-shrink-0 flex border-b border-gray-200 bg-gray-50">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 px-4 py-3 text-sm font-medium text-center transition-colors focus:outline-none ${
              activeTab === tab
                ? 'border-b-2 border-blue-600 text-blue-600 bg-white'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </nav>

      {/* 3. Contenido Principal: Crece para ocupar el espacio sobrante y tiene su propio scroll si es necesario */}
      <main className="flex-grow p-6 overflow-y-auto">
        {activeTab === 'General' && <ActivationControls />}
        {activeTab === 'Diccionarios' && <DictionaryTable />}
        {activeTab === 'Servicios' && <AnkiConnect />}
      </main>

      {/* 4. Pie de página: No se encoge */}
      <footer className="flex-shrink-0 flex justify-end space-x-3 p-4 bg-gray-50 border-t border-gray-200">
          <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50">
            Cerrar
          </button>
          <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700">
            Guardar Cambios
          </button>
      </footer>
    </div>
  );
}