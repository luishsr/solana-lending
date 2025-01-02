import React from 'react';
import ReactDOM from 'react-dom/client'; // Import `createRoot` from react-dom
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root')); // Create a root
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
