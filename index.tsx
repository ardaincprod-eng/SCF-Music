
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

console.log("SCF Music: index.tsx executing...");

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error("SCF Music: Root element not found!");
} else {
  try {
    const root = createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log("SCF Music: React render called.");
  } catch (err) {
    console.error("SCF Music: Render error:", err);
  }
}
