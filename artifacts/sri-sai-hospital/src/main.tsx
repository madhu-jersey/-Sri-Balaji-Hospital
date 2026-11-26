import { createRoot } from 'react-dom/client';

import App from './App';
import { LangProvider } from './i18n';
import { ErrorBoundary } from '@/components/error-boundary';

import './index.css';
import './premium.css';
import './hero.css';
import './mobile.css';
import './compact.css';
import './home-hero.css';
import './home-sections.css';
import './home-motion.css';
import './home-premium.css';
import './home-doctor.css';
import './home-mobile.css';
import './i18n.css';

createRoot(document.getElementById('root')!, {
  // Keeps caught errors off reportError(), which would raise the dev overlay.
  onCaughtError: (error, errorInfo) => {
    console.error(error, errorInfo.componentStack);
  },
}).render(
  <ErrorBoundary>
    <LangProvider>
      <App />
    </LangProvider>
  </ErrorBoundary>,
);
