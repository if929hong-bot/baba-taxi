import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './assets/styles/global.css'  // 這行一定要有！

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)