import React, { useState } from 'react';
import api from '../utils/api';
import './Register.css';

function Register({ setToken, setShowLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      await api.post('/register', { username, password, email });
      setSuccess('Registration successful! Please login.');
      setTimeout(() => {
        setShowLogin(true);
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.msg || 'Registration failed');
    }
  };

  return (
    <div className="register-bg">
      <form className="register-form" onSubmit={handleSubmit}>
        <h2>🌱 Create Account</h2>
        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}
        <input 
          value={username} 
          onChange={e => setUsername(e.target.value)} 
          placeholder="Username" 
          required 
          minLength={3}
        />
        <input 
          type="email" 
          value={email} 
          onChange={e => setEmail(e.target.value)} 
          placeholder="Email (optional)" 
        />
        <input 
          type="password" 
          value={password} 
          onChange={e => setPassword(e.target.value)} 
          placeholder="Password (min 6 characters)" 
          required 
          minLength={6}
        />
        <button type="submit">Register</button>
        <p className="login-link">
          Already have an account? 
          <button type="button" onClick={() => setShowLogin(true)}>
            Login here
          </button>
        </p>
      </form>
    </div>
  );
}

export default Register; 