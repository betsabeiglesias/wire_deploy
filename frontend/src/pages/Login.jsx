// Login.jsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "@/services/authService"; 
import { useAuthStore } from '../store/useAuthStore'; // ⬅️ ¡Importamos el Store de Zustand!

import "../styles/Login.css"; 

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // 🔑 Acceder a la acción 'login' del Store
  const zustandLogin = useAuthStore((state) => state.login); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // 1. Llama al servicio: Realiza la petición a Django y guarda los tokens en localStorage
      await login(username, password); 
      
      // 🔑 2. CLAVE: Informar a Zustand que el login fue exitoso
      // Esto actualiza isAuthenticated = true
      zustandLogin(username); 
      
      // 3. Navega al inicio (Home)
      navigate("/");

    } catch (err) {
      console.error("Error de conexión/autenticación:", err);
      
      // ... (Manejo de errores se mantiene igual) ...
      if (err.response && err.response.status === 401) {
        setError("Usuario o contraseña incorrectos");
      } else if (err.code === 'ERR_NETWORK' || !err.response) {
        setError("Error al conectar con el servidor. ¿Está el backend activo? (Network Error)");
      } else {
        setError("Error al conectar con el servidor o error desconocido.");
      }
    }
  };

  return (
    <div className="login-container">
      <h2 className="login-title">Inicio de Sesión</h2>
      <form onSubmit={handleSubmit} className="login-form">
        <input
          type="text"
          placeholder="Usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="login-input"
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="login-input"
          required
        />
        <button type="submit" className="login-button">
          Entrar
        </button>
      </form>
      {error && <p className="login-error">{error}</p>}
    </div>
  );
}

export default Login;