import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { AnalysisProvider } from './context/AnalysisContext.jsx'
import './index.css'

// Entry point for React app
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AnalysisProvider>
      <App />
    </AnalysisProvider>
  </React.StrictMode>,
)
