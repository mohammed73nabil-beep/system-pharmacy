import './bootstrap';
import '../css/app.css';

import React from 'react';
import { createRoot } from 'react-dom/client';
import AppRoot from './AppRoot';

console.log('App Entry Point (app.jsx) loaded');

const container = document.getElementById('app');
if (container) {
    console.log('Mounting AppRoot into #app');
    const root = createRoot(container);
    root.render(
        <React.StrictMode>
            <AppRoot />
        </React.StrictMode>
    );
} else {
    console.error('CRITICAL: #app element not found');
}
