import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './auth/AuthProvider';
import { ColorModeContextProvider } from './theme/themeContext';

const RootApp = () => {
  return (
    <ColorModeContextProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ColorModeContextProvider>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RootApp />
  </React.StrictMode>
);
