import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import DeviceControl from './components/DeviceControl';
import ReportViewer from './components/ReportViewer';
import './App.css';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [showLogin, setShowLogin] = useState(true);

  if (!token) {
    return showLogin ? 
      <Login setToken={setToken} setShowLogin={setShowLogin} /> : 
      <Register setToken={setToken} setShowLogin={setShowLogin} />;
  }

  return (
    <BrowserRouter>
      <nav className="main-nav">
        <span className="logo">🌱 Smart Home Energy</span>
        <Link to="/">Dashboard</Link>
        <Link to="/devices">Device Control</Link>
        <Link to="/report">Report</Link>
        <button className="logout-btn" onClick={() => { localStorage.removeItem('token'); setToken(null); }}>Logout</button>
      </nav>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/devices" element={<DeviceControl />} />
        <Route path="/report" element={<ReportViewer />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;