import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { TooltipApp } from './features/tooltip/components/TooltipApp';

const container = document.getElementById('root');
if (container) {
  createRoot(container).render(
    <StrictMode>
      <TooltipApp />
    </StrictMode>,
  );
}
