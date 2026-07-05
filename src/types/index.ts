// src/types/index.ts
export interface Mensaje {
  id?: string;
  remitente: string;
  username?: string;
  destinatario: string;
  contenido: string;
  timeStamp: string;
}

export interface UsuarioActivo {
  hash: string;
  username: string;
  email?: string;
}

export interface ApiResponse {
  message?: string;
  success?: string;
  token?: string;
  username?: string;
}