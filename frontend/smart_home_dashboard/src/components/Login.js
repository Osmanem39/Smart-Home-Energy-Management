// import React, { useState } from 'react';
// import api from '../utils/api';
// import './Login.css';

// function Login({ setToken }) {
//   const [username, setUsername] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');

//   const handleSubmit = async e => {
//     e.preventDefault();
//     try {
//       const res = await api.post('/login', { username, password });
//       setToken(res.data.access_token);
//       localStorage.setItem('token', res.data.access_token);
//     } catch {
//       setError('Invalid credentials');
//     }
//   };

//   return (
//     <div className="login-bg">
//       <form className="login-form" onSubmit={handleSubmit}>
//         <h2>🔋 Smart Home Energy Login</h2>
//         {error && <div className="error">{error}</div>}
//         <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" required />
//         <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required />
//         <button type="submit">Login</button>
//       </form>
//     </div>
//   );
// }

// export default Login;










































import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import './Login.css';

function Login({ setUser }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Username and password are required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.post('/login', { username, password });
      localStorage.setItem('token', res.data.access_token);
      setUser({
        id: res.data.user_id,
        username: res.data.username,
        token: res.data.access_token
      });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.msg || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>🔋 Smart Home Energy</h2>
        <h3>Login</h3>
        
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;