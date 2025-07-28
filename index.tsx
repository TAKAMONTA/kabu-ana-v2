import './index.css';

import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './src/App';
import ErrorBoundary from '@/components/ErrorBoundary';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then((registration) => {
        console.log('PWA: Service Worker registered successfully:', registration.scope);
      })
      .catch((error) => {
        console.log('PWA: Service Worker registration failed:', error);
      });
  });
}