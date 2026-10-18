import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { installEmailLinkMenu } from './utils/emailLinks';

// email links: the device's own mail app; on computers without one, a Gmail / Outlook / copy menu
installEmailLinkMenu();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
