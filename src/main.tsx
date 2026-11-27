import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { ToolbarPopup } from './widgets/ToolbarPopup';

const container = document.getElementById('root');
if (container) {
  createRoot(container).render(
    <StrictMode>
      <ToolbarPopup />
    </StrictMode>,
  );
}
