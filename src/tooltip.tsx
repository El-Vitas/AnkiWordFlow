import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import type { Root } from 'react-dom/client';
import './index.css';
import  type{ TooltipData } from './types/tooltip'; // Asegúrate de que la ruta sea correcta
// Interfaz para definir la forma de nuestros datos


// Componente de la UI del Tooltip
export const SelectionTooltip: React.FC<{ data: TooltipData }> = ({ data }) => {
  return (
    <div className="p-4 bg-white rounded-lg shadow-2xl border border-gray-200 text-black max-w-sm flex flex-col gap-2 h-full">
      <div>
        <span className="font-bold text-lg text-blue-700">{data.word}</span>
        <span className="text-sm text-gray-500 ml-2">({data.synonym})</span>
      </div>
      <p className="text-sm text-gray-800">{data.definition}</p>
      <p className="text-sm text-gray-500 italic border-l-2 border-gray-300 pl-2">{data.context}</p>
    </div>
  );
};

const TooltipApp: React.FC = () => {
  const [data, setData] = useState<TooltipData | null>(null);

  useEffect(() => {
    // 1. Apenas se monte el componente, envía un mensaje al script padre
    window.parent.postMessage({ type: 'TOOLTIP_READY' }, '*');

    // 2. Prepara el listener para recibir los datos como antes
    const handleMessage = (event: MessageEvent<TooltipData>) => {
      if (event.data && typeof event.data.word === 'string') {
        setData(event.data);
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  if (!data) {
    return <div className="p-4 text-sm text-center text-gray-500">Cargando...</div>;
  }

  return <SelectionTooltip data={data} />;
};

const container = document.getElementById('root');
if (container) {
  const root: Root = createRoot(container);
  root.render(
    <React.StrictMode>
      <TooltipApp />
    </React.StrictMode>
  );
}