# 💬 Javachat - Frontend

![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2-3178C6?style=flat&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?style=flat&logo=vite)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3-7952B3?style=flat&logo=bootstrap)
![Netlify](https://img.shields.io/badge/Netlify-00C7B7?style=flat&logo=netlify)

Aplicación de chat en tiempo real con autenticación JWT, desarrollada con React, TypeScript y WebSocket. Esta es la interfaz de usuario del proyecto Javachat.

## 🚀 Demo

<!-- Reemplaza con tu URL de Netlify cuando esté desplegado -->
🔗 [Live Demo](https://javachat-react.netlify.app)

## ✨ Características

- 🔐 **Autenticación JWT** - Login y registro de usuarios
- 💬 **Chat en tiempo real** - Mensajería instantánea con WebSocket
- 📜 **Historial de mensajes** - Carga los últimos 30 mensajes
- 👥 **Usuarios activos** - Lista de usuarios conectados en tiempo real
- 🎨 **Diseño moderno** - Interfaz oscura con gradientes
- 📱 **Responsive** - Adaptado a todos los dispositivos
- 🔄 **Reconexión automática** - Reconexión automática de WebSocket

## 🛠️ Tecnologías

- **React 19** - Biblioteca principal
- **TypeScript 5.2** - Tipado estático
- **Vite 5.0** - Build tool y dev server
- **Bootstrap 5.3** - Estilos y componentes
- **WebSocket API** - Comunicación en tiempo real
- **Netlify** - Hosting y despliegue

## 📁 Estructura del Proyecto

src/
├── components/
│ ├── ChatRoom.tsx # Componente principal del chat
│ └── Login.tsx # Pantalla de login/registro
├── services/
│ └── mensajeService.ts # Servicio para API de mensajes
├── types/
│ └── index.ts # Definiciones de tipos
├── App.tsx # Componente raíz
├── index.css # Estilos globales
└── main.tsx # Punto de entrada



## 🚀 Instalación y Ejecución

### Requisitos Previos
- Node.js 18+
- pnpm (recomendado) o npm

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/javachat-react.git
cd javachat-react

# Instalar dependencias con pnpm
pnpm install

# o con npm
npm install
```


Variables de Entorno

Crear un archivo .env en la raíz:
VITE_API_URL=https://javachat.onrender.com
VITE_WS_URL=wss://javachat.onrender.com/ws



Modo Desarrollo

```bash
# Con pnpm
pnpm dev

# Con npm
npm run dev
```

Modo Producción

```bash
# Construir
pnpm build

# Vista previa de la build
pnpm preview
```


🐳 Docker
Construir la imagen

```bash
docker build -t javachat-frontend .
```

Ejecutar el contenedor
```bash
docker stop javachat-frontend
docker rm javachat-frontend
```



Detener y eliminar

```bash

docker stop javachat-frontend
docker rm javachat-frontend

```

🌐 Despliegue


Netlify (Recomendado)

```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Desplegar
netlify deploy --prod

```

Vercel
```bash
# Instalar Vercel CLI
npm install -g vercel

# Login
vercel login

# Desplegar
vercel --prod

```

GitHub Pages
```bash

# Instalar gh-pages
npm install -D gh-pages

# Agregar scripts al package.json
# "deploy": "gh-pages -d dist"

# Desplegar
npm run deploy

```

📦 Dependencias Principales

{
  "react": "^19.0.0",
  "react-dom": "^19.0.0",
  "typescript": "^5.2.2",
  "vite": "^5.0.0",
  "bootstrap": "^5.3.0",
  "@types/react": "^19.0.0",
  "@types/react-dom": "^19.0.0"
}


👤 Autor

Tu Nombre

   GitHub: @iwanehu

  LinkedIn: https://www.linkedin.com/in/snayder-marulanda/

  Portfolio:  https://portafoliosnay.netlify.app/


🙏 Agradecimientos

  Spring Boot - Backend

  MongoDB - Base de datos

   Render - Hosting del backend

   Netlify - Hosting del frontend




   ⭐️ ¡Si este proyecto te ha sido útil, no olvides darle una estrella en GitHub!

    

