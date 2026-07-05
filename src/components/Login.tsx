import React, { useState } from 'react';

interface LoginProps {
  onLoginSuccess: (username: string) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (isRegistering && password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    if (isRegistering && password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      setLoading(false);
      return;
    }

    const endpoint = isRegistering 
      ? 'https://javachat.onrender.com/api/auth/registro'
      : 'https://javachat.onrender.com/api/auth/login';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data || 'Error en la solicitud');
      }

      if (isRegistering) {
        setSuccess('✅ ¡Usuario registrado correctamente!');
        setError('');
        setUsername('');
        setPassword('');
        setConfirmPassword('');
        setTimeout(() => {
          setIsRegistering(false);
          setSuccess('');
        }, 2000);
      } else {
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', data.username);
        onLoginSuccess(data.username);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        let errorMessage = err.message;
        if (errorMessage.startsWith('"') && errorMessage.endsWith('"')) {
          errorMessage = errorMessage.slice(1, -1);
        }
        setError(errorMessage);
      } else if (typeof err === 'string') {
        setError(err);
      } else {
        setError('Error desconocido');
      }
      setSuccess('');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setError('');
    setSuccess('');
    setUsername('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="login-card">
      <h1 className="login-title">
        {isRegistering ? '📝 Registro' : '💬 Chat Room'}
      </h1>
      
      <p className="login-subtitle">
        {isRegistering ? 'Crea una nueva cuenta' : 'Inicia sesión para chatear'}
      </p>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="login-label">👤 Usuario</label>
          <input
            type="text"
            className="login-input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Ingresa tu usuario"
            required
          />
        </div>
        
        <div className="mb-3">
          <label className="login-label">🔒 Contraseña</label>
          <input
            type="password"
            className="login-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={isRegistering ? "Mínimo 8 caracteres" : "Ingresa tu contraseña"}
            required
          />
        </div>

        {isRegistering && (
          <div className="mb-3">
            <label className="login-label">🔐 Confirmar Contraseña</label>
            <input
              type="password"
              className="login-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repite tu contraseña"
              required
            />
          </div>
        )}

        {error && <div className="login-error">❌ {error}</div>}
        {success && <div className="login-success">{success}</div>}

        <button type="submit" className="login-button" disabled={loading}>
          {loading ? '⏳ Procesando...' : isRegistering ? '📝 Registrarse' : '🚀 Iniciar Sesión'}
        </button>
      </form>

      <button className="login-toggle" onClick={toggleMode}>
        {isRegistering 
          ? '¿Ya tienes cuenta? Inicia sesión' 
          : '¿No tienes cuenta? Regístrate'}
      </button>
    </div>
  );
}