import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { OptionsLayout } from './widgets/OptionsLayout';

const container = document.getElementById('root');
if (container) {
  createRoot(container).render(
    <StrictMode>
      <OptionsLayout />
    </StrictMode>,
  );
}
