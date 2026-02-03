import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api'; 
import { useAuthStore } from '../store/useAuthStore';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const fetchCurrentUser = useAuthStore((state) => state.fetchCurrentUser);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // 1. Login para establecer las cookies
      const response = await api.post('api/auth/token/', { username, password });
      
      // 2. Guardamos lo que nos de el login inicialmente
      setAuth(response.data);

      // 3. ¡IMPORTANTE! Pedimos los datos completos (date_joined, etc.) 
      // y esperamos a que termine antes de redirigir.
      await fetchCurrentUser();
      
      // 4. Ahora que el store está lleno, navegamos
      navigate('/');
      
    } catch (err) {
      console.error("Error en login:", err);
      setError(err.response?.data?.detail || "Credenciales inválidas o error de servidor.");
    } finally {
      setIsSubmitting(false);
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
            disabled={isSubmitting}
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
            disabled={isSubmitting}
          />
        </div>
        
        {error && <p style={{ color: 'red', fontSize: '14px' }}>{error}</p>}
        
        <button 
          type="submit" 
          style={{ 
            width: '100%', 
            padding: '10px', 
            backgroundColor: isSubmitting ? '#ccc' : '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: isSubmitting ? 'not-allowed' : 'pointer' 
          }}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
};

export default Login;