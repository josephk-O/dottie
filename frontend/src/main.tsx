import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './globals.css';
import { AssessmentResultProvider } from './context/assessment/AssessmentResultProvider';
import { AuthProvider } from '@/src/context/auth/AuthContextProvider';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <AssessmentResultProvider>
        <App />
      </AssessmentResultProvider>
    </AuthProvider>
  </React.StrictMode>
);
