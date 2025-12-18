import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

console.log("SCF Music: index.tsx başlatılıyor...");

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error("SCF Music: Root elementi bulunamadı!");
} else {
  try {
    const root = createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (err) {
    console.error("SCF Music: Render hatası:", err);
  }
}