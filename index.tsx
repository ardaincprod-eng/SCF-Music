
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Sayfa yüklendiğinde loader'ı gizle
const hideLoader = () => {
    const loader = document.getElementById('loader');
    if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => loader.style.display = 'none', 500);
    }
};

const container = document.getElementById('root');

if (container) {
    const root = createRoot(container);
    root.render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
    // React render olduktan kısa süre sonra loader'ı kaldır
    setTimeout(hideLoader, 300);
} else {
    console.error("Kritik Hata: 'root' elementi HTML içinde bulunamadı!");
}
