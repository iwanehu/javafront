import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { mensajeService } from '../services/mensajeService';
import type { Mensaje, UsuarioActivo } from '../types';

interface ChatRoomProps {
  username: string;
  onLogout: () => void;
}

interface MessagePayload {
  remitente: string;
  username?: string;
  contenido: string;
  type?: string;
  timeStamp?: string;
}

export default function ChatRoom({ username, onLogout }: ChatRoomProps) {
  const [message, setMessage] = useState('');
  const [mensajesBase, setMensajesBase] = useState<MessagePayload[]>([]);
  const [usuariosActivos, setUsuariosActivos] = useState<UsuarioActivo[]>([]);
  const [miHashSesion, setMiHashSesion] = useState<string>('');
  const [connected, setConnected] = useState(false);
  const [loadingHistorial, setLoadingHistorial] = useState(true);
  
  const socketRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const WS_URL = "wss://javachat.onrender.com/ws";

  // Crear mapa de usuarios usando useMemo
  const userMap = useMemo(() => {
    const map = new Map<string, string>();
    usuariosActivos.forEach(user => {
      map.set(user.hash, user.username);
    });
    return map;
  }, [usuariosActivos]);

  // Función para obtener el nombre de usuario usando useCallback
  const getDisplayName = useCallback((hash: string, usernameFromMsg?: string): string => {
    if (hash === 'SISTEMA') return 'SISTEMA';
    if (hash === miHashSesion) return 'Tú';
    
    if (usernameFromMsg && 
        usernameFromMsg !== 'Anónimo' && 
        !usernameFromMsg.startsWith('usr_') && 
        usernameFromMsg !== hash) {
      return usernameFromMsg;
    }
    
    if (userMap.has(hash)) {
      return userMap.get(hash) || hash;
    }
    
    if (usernameFromMsg === 'Anónimo') {
      return 'Anónimo';
    }
    
    return hash.substring(0, 8);
  }, [miHashSesion, userMap]);

  // Calcular mensajes con nombres actualizados
  const messages = useMemo(() => {
    return mensajesBase.map(msg => {
      if (msg.remitente === 'SISTEMA') {
        return { ...msg, username: 'SISTEMA' };
      }
      
      const displayName = getDisplayName(msg.remitente, msg.username);
      return { ...msg, username: displayName };
    });
  }, [mensajesBase, getDisplayName]); // ✅ Agregamos getDisplayName

  // Cargar historial al montar el componente
  useEffect(() => {
    const cargarHistorial = async () => {
      setLoadingHistorial(true);
      try {
        console.log('🔄 Cargando historial...');
        const historial = await mensajeService.getHistorial(30);
        
        if (historial && historial.length > 0) {
          const mensajesFormateados = historial.map((msg: Mensaje) => {
            const isSystem = msg.remitente === 'SISTEMA';
            
            if (isSystem) {
              return {
                remitente: 'SISTEMA',
                username: 'SISTEMA',
                contenido: msg.contenido || 'Mensaje vacío',
                timeStamp: msg.timeStamp || new Date().toISOString()
              };
            }
            
            let displayName = msg.username || msg.remitente;
            
            if (displayName.startsWith('usr_')) {
              displayName = displayName.substring(0, 8);
            }
            
            return {
              remitente: msg.remitente || 'SISTEMA',
              username: displayName,
              contenido: msg.contenido || 'Mensaje vacío',
              timeStamp: msg.timeStamp || new Date().toISOString()
            };
          });
          
          setMensajesBase(mensajesFormateados);
          console.log('✅ Mensajes cargados:', mensajesFormateados.length);
        } else {
          console.log('📭 No hay historial disponible');
          setMensajesBase([]);
        }
      } catch (error) {
        console.error('❌ Error cargando historial:', error);
        setMensajesBase([]);
      } finally {
        setLoadingHistorial(false);
      }
    };

    cargarHistorial();
  }, []);

  // Conexión WebSocket
  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 3;

    const connectWebSocket = () => {
      console.log("🔌 Conectando WebSocket...");
      ws = new WebSocket(WS_URL, "text");
      socketRef.current = ws;

      ws.onopen = () => {
        console.log("✅ Conexión WebSocket establecida");
        setConnected(true);
        reconnectAttempts = 0;

        let tokenReal = localStorage.getItem("token") || "";
        if (tokenReal.startsWith('"') && tokenReal.endsWith('"')) {
          tokenReal = tokenReal.slice(1, -1);
        }
        tokenReal = tokenReal.trim();

        const initPayload = {
          type: "CONNECT_INIT",
          token: tokenReal,
          username: username
        };

        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(initPayload));
          console.log("📤 CONNECT_INIT enviado");
        }
      };

      ws.onmessage = (event) => {
        try {
          const datos = JSON.parse(event.data);

          switch (datos.type) {
            case "INIT_SUCCESS":
              console.log("✅ Inicialización exitosa. Hash:", datos.hashSesion);
              setMiHashSesion(datos.hashSesion);
              break;

            case "LISTA_USUARIOS":
              console.log("👥 Usuarios activos:", datos.total);
              setUsuariosActivos(datos.usuarios || []);
              break;

            case "SISTEMA":
              console.log("ℹ️ Sistema:", datos.contenido);
              setMensajesBase(prev => {
                if (prev.length > 0 && prev[prev.length - 1].contenido === datos.contenido) {
                  return prev;
                }
                return [...prev, {
                  remitente: "SISTEMA",
                  username: "SISTEMA",
                  contenido: datos.contenido
                }];
              });
              break;

            case "MENSAJE":
              console.log(`💬 [${datos.username}]: ${datos.contenido}`);
              setMensajesBase(prev => [...prev, {
                remitente: datos.remitente,
                username: datos.username,
                contenido: datos.contenido,
                timeStamp: datos.timeStamp
              }]);
              break;

            default:
              if (datos.remitente && datos.contenido) {
                setMensajesBase(prev => [...prev, datos]);
              }
          }
        } catch (error) {
          console.error("❌ Error procesando mensaje:", error);
        }
      };

      ws.onerror = (error) => {
        console.error("❌ Error WebSocket:", error);
        setConnected(false);
      };

      ws.onclose = (event) => {
        console.log(`🔌 WebSocket cerrado. Código: ${event.code}`);
        setConnected(false);
        
        if (event.code !== 1000 && reconnectAttempts < maxReconnectAttempts) {
          reconnectAttempts++;
          console.log(`🔄 Reconectando... Intento ${reconnectAttempts}/${maxReconnectAttempts}`);
          setTimeout(connectWebSocket, 3000);
        }
      };
    };

    const timeoutId = setTimeout(connectWebSocket, 100);

    return () => {
      clearTimeout(timeoutId);
      if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
        ws.close(1000, "Cerrando conexión");
      }
    };
  }, [username]);

  // Auto-scroll al último mensaje
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !socketRef.current) return;
    
    if (socketRef.current.readyState !== WebSocket.OPEN) {
      console.warn("⚠️ WebSocket no está abierto");
      return;
    }

    const payload = {
      contenido: message.trim()
    };

    socketRef.current.send(JSON.stringify(payload));
    setMessage('');
  };

  const handleDisconnect = () => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.close(1000, "Usuario desconectado");
    }
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    onLogout();
  };

  return (
    <div className="chat-container">
      
      {/* Columna Principal del Chat */}
      <div className="d-flex flex-column" style={{ flex: 1, height: '100%' }}>
        
        {/* Header */}
        <div className="chat-header">
          <div className="chat-status">
            <span className={connected ? 'chat-status-connected' : 'chat-status-disconnected'}>
              {connected ? '🟢 Conectado' : '🔴 Desconectado'}
            </span>
            {loadingHistorial && (
              <span className="chat-status-loading">⏳ Cargando historial...</span>
            )}
          </div>
          <span className="chat-message-count">📨 {messages.length} mensajes</span>
        </div>

        {/* Panel de Mensajes */}
        <div className="chat-messages">
          {loadingHistorial ? (
            <div className="chat-empty">
              <div style={{ fontSize: '30px', marginBottom: '10px' }}>⏳</div>
              <p>Cargando historial...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="chat-empty">
              <div className="chat-empty-icon">💬</div>
              <p className="chat-empty-text">No hay mensajes aún</p>
              <small className="chat-empty-sub">¡Sé el primero en enviar un mensaje!</small>
            </div>
          ) : (
            messages.map((msg, index) => {
              const isSystem = msg.remitente === 'SISTEMA';
              const isOwn = msg.remitente === miHashSesion;
              
              if (isSystem) {
                return (
                  <div key={`system-${index}`} className="message-wrapper message-wrapper-center">
                    <div className="message-system">{msg.contenido}</div>
                  </div>
                );
              }
              
              let displayName = msg.username || msg.remitente;
              
              if (isOwn) {
                displayName = 'Tú';
              } else if (displayName.startsWith('usr_') && displayName.length > 8) {
                displayName = displayName.substring(0, 8);
              } else if (displayName === 'Anónimo') {
                displayName = 'Anónimo';
              }
              
              return (
                <div 
                  key={`msg-${index}`} 
                  className={`message-wrapper ${isOwn ? 'message-wrapper-end' : 'message-wrapper-start'}`}
                >
                  <div className={`message-bubble ${isOwn ? 'message-bubble-own' : 'message-bubble-other'}`}>
                    <span className={`message-sender ${isOwn ? 'message-sender-own' : 'message-sender-other'}`}>
                      {isOwn ? '👤 Tú' : `👤 ${displayName}`}
                    </span>
                    <span className="message-content">{msg.contenido}</span>
                    {msg.timeStamp && (
                      <span className="message-timestamp">
                        🕐 {new Date(msg.timeStamp).toLocaleString('es-ES', { 
                          hour: '2-digit', 
                          minute: '2-digit',
                          day: '2-digit',
                          month: '2-digit'
                        })}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Barra de Entrada */}
        <form className="chat-input-form" onSubmit={handleSendMessage}>
          <input 
            type="text" 
            className="chat-input"
            value={message} 
            onChange={(e) => setMessage(e.target.value)}
            placeholder={connected ? "✏️ Escribe un mensaje..." : "⏳ Conectando..."}
            disabled={!connected}
          />
          <button 
            type="submit" 
            className="chat-send-button"
            disabled={!connected || !message.trim()}
          >
            🚀 Enviar
          </button>
        </form>
      </div>

      {/* Barra Lateral - Usuarios Activos */}
      <div className="chat-sidebar">
        <div>
          <h5 className="chat-sidebar-title">
            👥 Usuarios Activos
            <span className="chat-sidebar-badge">{usuariosActivos.length}</span>
          </h5>
          
          <div className="chat-users-list">
            {usuariosActivos.length === 0 ? (
              <div className="text-center py-2" style={{ color: '#6b7280', fontSize: '13px' }}>
                ⏳ Esperando usuarios...
              </div>
            ) : (
              usuariosActivos.map((user, idx) => {
                const esYo = user.hash === miHashSesion;
                return (
                  <div 
                    key={`user-${idx}`} 
                    className={`chat-user-item ${esYo ? 'chat-user-item-own' : 'chat-user-item-other'}`}
                  >
                    <span className="chat-user-indicator">🟢</span>
                    <span className="chat-user-name">{esYo ? '👤 Tú' : user.username}</span>
                    {esYo && <span className="chat-user-badge">(tú)</span>}
                  </div>
                );
              })
            )}
          </div>

          <div className="chat-user-session">
            <span className="chat-user-session-name">{username}</span>
            <span className="chat-user-session-hash">
              🔑 {miHashSesion ? miHashSesion.substring(0, 8) + '...' : '---'}
            </span>
          </div>
        </div>

        <button className="chat-disconnect-button" onClick={handleDisconnect}>
          🚪 Desconectarse
        </button>
      </div>

    </div>
  );
}