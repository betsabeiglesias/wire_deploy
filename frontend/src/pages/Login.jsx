import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api'; // Tu instancia de axios con withCredentials
import { useAuthStore } from '../store/useAuthStore';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      // 1. Enviamos credenciales al nuevo LoginView de Django.
      // El servidor responderá inyectando las cookies HttpOnly directamente.
      const response = await api.post('/api/token/', { username, password });

      // 2. 'response.data' ahora solo contiene el objeto del usuario {username, email, ...}
      // Ya no recibimos tokens aquí porque van en las cookies.
      const userData = response.data;

      // 3. Guardamos los datos del usuario en el store (Zustand)
      setAuth(userData);
      
      // 4. Redirigimos al inicio (o al dashboard según prefieras)
      navigate('/');
      
    } catch (err) {
      console.error("Error en login:", err);
      // Capturamos el error que viene del backend o ponemos uno por defecto
      setError(err.response?.data?.detail || "Credenciales inválidas o error de servidor.");
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '100px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#fff' }}>
      <h2 style={{ textAlign: 'center' }}>Iniciar Sesión</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Usuario:</label>
          <input 
            type="text" 
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            required 
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Contraseña:</label>
          <input 
            type="password" 
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
        </div>
        
        {error && <p style={{ color: 'red', fontSize: '14px' }}>{error}</p>}
        
        <button 
          type="submit" 
          style={{ width: '100%', padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Entrar
        </button>
      </form>
    </div>
  );
};

export default Login;