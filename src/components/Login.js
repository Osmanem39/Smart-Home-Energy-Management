import React, { useState } from 'react';
import api from '../utils/api';
import './Login.css';

function Login({ setToken, setShowLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await api.post('/login', { username, password });
      setToken(res.data.access_token);
      localStorage.setItem('token', res.data.access_token);
    } catch {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="login-bg">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>🔋 Smart Home Energy Login</h2>
        {error && <div className="error">{error}</div>}
        <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" required />
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required />
        <button type="submit">Login</button>
        <p className="register-link">
          Don't have an account? 
          <button type="button" onClick={() => setShowLogin(false)}>
            Register here
          </button>
        </p>
      </form>
    </div>
  );
}

export default Login;