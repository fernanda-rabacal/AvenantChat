# Avenant Chat App

<div align="center">
  <img src="https://img.shields.io/badge/status-active-success.svg" alt="Status">
  <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License">
</div>

## 📌 Overview | Visão Geral

🇺🇸 **English**  
A full-stack real-time chat application built with modern technologies. This application enables users to communicate in real-time, manage chat rooms, and interact with other users in a seamless experience.

🇧🇷 **Português**  
Uma aplicação full-stack de chat em tempo real construída com tecnologias modernas. Esta aplicação permite que os usuários se comuniquem em tempo real, gerenciem salas de chat e interajam com outros usuários de forma integrada.

##### You can access the website here: https://avenant-chat.vercel.app/

## ✨ Features | Funcionalidades

### User Management | Gestão de Usuários
- 🔐 User Registration and Authentication | Registro e Autenticação de Usuários
- 👤 User Profile Management | Gerenciamento de Perfil de Usuário
- 🔑 Secure Login System | Sistema de Login Seguro

### Chat Functionality | Funcionalidades do Chat
- 💬 Real-time Messaging | Mensagens em Tempo Real
- 🗑️ Edit/Delete Messages | Editar/Deletar Mensagens
- 👥 View Online Users | Visualizar Usuários Online
- 🏠 Multiple Chat Rooms | Múltiplas Salas de Chat
- 📝 Message History | Histórico de Mensagens

### Room Management | Gestão de Salas
- 🔍 Browse Available Rooms | Navegar por Salas Disponíveis
- ➕ Join Multiple Rooms | Entrar em Múltiplas Salas
- 👀 View Room Participants | Visualizar Participantes da Sala

## 📁 Project Structure | Estrutura do Projeto

```
avenant_chat/
├── .docker/                # Docker configuration files
├── .github/                # GitHub workflows and configuration
├── backend/               
│   ├── src/               # Backend source code
│   ├── prisma/            # Database schema and migrations
│   ├── test/              # Backend tests
│   ├── dist/              # Compiled backend code
│   └── generated/         # Generated Prisma client
├── frontend/
│   ├── src/               # Frontend source code
│   ├── public/            # Static files
│   └── components.json    # UI components configuration
├── docker-compose.yml     # Docker compose configuration
└── README.md             # Project documentation
```

### Key Directories | Diretórios Principais

#### Backend Structure
- `backend/src/` - Main application code
- `backend/prisma/` - Database schema and migrations
- `backend/test/` - Unit and integration tests
- `backend/generated/` - Auto-generated Prisma client code

#### Frontend Structure
- `frontend/src/` - React components and application logic
- `frontend/public/` - Static assets and public files
- `frontend/components.json` - UI component configurations

#### Infrastructure
- `.docker/` - Docker configuration and setup files
- `.github/` - CI/CD workflows and GitHub configurations

## 🛠️ Technical Stack | Stack Técnica

### Frontend
- **React.js** - UI Framework
- **TypeScript** - Programming Language
- **Tailwind CSS** - Styling
- **Socket.io Client** - Real-time Communication

### Backend
- **Nest.js** - Server Framework
- **Prisma** - ORM
- **PostgreSQL** - Database
- **Socket.io** - WebSocket Implementation

### Infrastructure
- **Docker** - Containerization
- **Docker Compose** - Container Orchestration

## 🚀 Getting Started | Começando

### Prerequisites | Pré-requisitos

- Node.js (v14 or higher)
- npm or yarn
- Docker and Docker Compose (for containerized setup)
- PostgreSQL (for local setup)

### Environment Setup | Configuração do Ambiente

1. Clone the repository:
```bash
git clone https://github.com/yourusername/avenant_chat.git
cd avenant_chat
```

2. Environment Variables | Variáveis de Ambiente:
Create a `.env` file based on `.env.local` and configure:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
SYSTEM_USER_PASSWORD="your_system_password"
SECRET="your_jwt_secret_key"
```

### Installation Methods | Métodos de Instalação

#### 🐳 Using Docker | Usando Docker

Change your `DATABASE_URL` on your `.env` file to:
```env
DATABASE_URL="postgresql://user:password@db:5432/dbname"
```

1. Build the containers:
```bash
docker compose build
```

2. Start the application:
```bash
docker compose up -d
```

#### 💻 Manual Setup | Configuração Manual

1. Backend Setup:
```bash
cd backend
npm install
npx prisma migrate dev
npm start
```

2. Frontend Setup:
```bash
cd frontend
npm install
npm run dev
```

### 🌐 Access the Application | Acessar a Aplicação

- Frontend: http://localhost:5173
- Backend API: http://localhost:8080

## 📚 API Documentation | Documentação da API

The API documentation is available at:
- Swagger UI: http://localhost:8080/api-docs

## 🧪 Testing | Testes

```bash
# Run backend tests
cd backend && npm test

# Run frontend tests
cd frontend && npm test
```

## 🤝 Contributing | Contribuindo

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License | Licença

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔧 Technologies | Tecnologias

<div>
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white"> 
  <img src="https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white"> 
  <img src="https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&badgeColor=010101"> 
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white"> 
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB"/> 
  <img src="https://img.shields.io/badge/Node%20js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" /> 
  <img src="https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white" /> 
  <img src="https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white" /> 
  <img src="https://img.shields.io/badge/nestjs-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white" /> 
  <img src="https://img.shields.io/badge/Docker-0db7ed?style=for-the-badge&logo=docker&logoColor=white" /> 
</div>
