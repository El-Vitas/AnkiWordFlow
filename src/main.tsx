import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import PopupView from './PopupView'
// import { OptionsView } from './views/OptionsView'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PopupView />
    {/* <OptionsView /> */}
  </StrictMode>,
)
