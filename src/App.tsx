import { useState } from 'react';
import Login from './components/Login';
import ChatRoom from './components/ChatRoom';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const token = localStorage.getItem('token');
    const savedUsername = localStorage.getItem('username');
    return !!(token && savedUsername);
  });
  
  const [username, setUsername] = useState(() => {
    return localStorage.getItem('username') || '';
  });

  const handleLoginSuccess = (user: string) => {
    setUsername(user);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setIsLoggedIn(false);
    setUsername('');
  };

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 p-3">
      {!isLoggedIn ? (
        <Login onLoginSuccess={handleLoginSuccess} />
      ) : (
        <ChatRoom username={username} onLogout={handleLogout} />
      )}
    </div>
  );
}