// src/services/mensajeService.ts
import type { Mensaje } from '../types';

const API_URL = 'https://javachat.onrender.com/api';

export const mensajeService = {
  // Obtener historial de mensajes
  async getHistorial(limite: number = 30): Promise<Mensaje[]> {
    try {
      console.log('📡 Solicitando historial...');
      const response = await fetch(`${API_URL}/mensajes/historial?limite=${limite}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      console.log('📡 Respuesta recibida:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response:', response.status, errorText);
        throw new Error(`Error ${response.status}`);
      }

      const data = await response.json();
      console.log('📜 Historial recibido:', data.length, 'mensajes');
      
      if (data.length > 0) {
        console.log('📝 Primer mensaje:', data[0]);
        console.log('📝 Último mensaje:', data[data.length - 1]);
      }
      
      return data;
    } catch (error) {
      console.error('❌ Error fetching historial:', error);
      return [];
    }
  },

  // Obtener mensajes públicos
  async getMensajesPublicos(): Promise<Mensaje[]> {
    try {
      const response = await fetch(`${API_URL}/mensajes/publicos`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Error obteniendo mensajes públicos:', error);
      return [];
    }
  },

  // Contar mensajes (para debug)
  async contarMensajes(): Promise<string> {
    try {
      const response = await fetch(`${API_URL}/mensajes/count`);
      if (!response.ok) {
        throw new Error(`Error ${response.status}`);
      }
      return await response.text();
    } catch (error) {
      console.error('❌ Error contando mensajes:', error);
      return 'Error';
    }
  },

  // Guardar un mensaje
  async guardarMensaje(mensaje: Partial<Mensaje>): Promise<Mensaje | null> {
    try {
      const response = await fetch(`${API_URL}/mensajes/guardar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(mensaje)
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Error saving mensaje:', error);
      return null;
    }
  },

  // Crear mensaje de prueba
  async crearMensajePrueba(): Promise<string> {
    try {
      const response = await fetch(`${API_URL}/mensajes/crear-prueba`, {
        method: 'POST'
      });
      return await response.text();
    } catch (error) {
      console.error('❌ Error creando mensaje de prueba:', error);
      return 'Error';
    }
  }
};