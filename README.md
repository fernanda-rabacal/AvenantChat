# Avenant Chat App

🇺🇸 This is a full stack project of a chat web app where you can contact your friend in real time, see available chat rooms and enter as many rooms as you like. This project is made with Reactjs and Nest.js, also using Sass and Prisma, Postgres database and Docker. Any issues you find, feel free to create an issue on this repository!

🇧🇷 Este é um projeto Full Stack de uma aplicação web de Chat onde você pode contactar seus amigos em tempo real, ver salas de chat disponíveis e entrar em quantas salas você quiser. Este projeto foi feito com Reactjs e Nest.js, também usando Sass e Prisma, o banco de dados Postgres e Docker. Qualquer problema que você encontrar, sinta-se à vontade para criar uma issue neste repositório!

#### Funcionalities / Funcionalidades:

- Login on your account / Fazer login na sua conta
- Register an account / Criar uma conta
- See chat rooms / Ver salas de chat
- Enter a room / Entrar em uma sala
- Send Message in a chat room / Mandar mensagens em uma sala de chat
- See your chat rooms / Ver seus chats
- See online members and their messages in a room / Ver membros online e as mensagens deles na sala

#

### How to run the project / Como rodar o Projeto:

🇺🇸 This repository has the frontend and the backend of the application. To run the project with Docker, you need to install it. Clone the repository to your computer and follow the steps to run the project with Docker. 
To run this project without Docker, you need to have Node.js and npm installed. Also, you can connect to Postgres Database through Dbeaver. After you cloned the repository, enter in the respectives folders and see the steps below to run the code.

IMPORTANT – This repository includes a .env.local file. Create a .env file based on this .env.local, and add a value for the variable SYSTEM_USER_PASSWORD (it can be any text you like) and a value for SECRET so that NestJWT can connect securely (this can also be any string, but It's highly recommended to use a long and complex value for the SECRET variable — similar to a strong password. Include uppercase and lowercase letters, numbers, and special characters to make it more secure (e.g., !f92JKl@#gPz8$!tRwZ). This helps protect your application's authentication system).

#

🇧🇷 Este repositório contém o frontend e o backend da aplicação. Para rodar o projeto com Docker, é necessário tê-lo instalado. Clone o repositório no seu computador e siga os passos para rodar o projeto com Docker.
Para rodar este projeto sem Docker, você precisa ter o Node.js e o npm instalados. Além disso, você pode se conectar ao banco Postgres pelo Dbeaver. Depois de clonar o repositório, entre nas pastas correspondentes e veja os passos abaixo para rodar o código.

IMPORTANTE - Este repositório possui um arquivo '.env.local'. Crie um arquivo .env file baseado neste .env.local e adicione um valor à variavel SYSTEM_USER_PASSWORD (pode ser qualquer texto que você quiser) e um valor à SECRET para que o NestJWT possa conectar com segurança (também pode ser qualquer valor de string mas é altamente recomendado usar um valor longo e complexo para a variável SECRET — semelhante a uma senha forte. Inclua letras maiúsculas e minúsculas, números e caracteres especiais para torná-la mais segura (por exemplo: !f92JKl@#gPz8$!tRwZ). Isso ajuda a proteger o sistema de autenticação da sua aplicação.)

  #### Docker

  🇺🇸 On the root folder terminal, run `docker compose build` to build the containers. After, just run `docker compose up` to start the containers. If you like, use the flag `-d` on this command to detach the docker log off the terminal.

  🇧🇷 Na pasta raiz, execute `docker-compose build` no terminal para construir os containers. Depois, basta executar `docker-compose up` para iniciar os containers. Se preferir, use a flag -d junto nesse comando para desacoplar os logs do Docker do terminal.


  #### Backend

  🇺🇸 Make sure to make a connection to Postgres using the credentials on the .env file. Also, change the DATABASE_URL value from 'db:5432' to 'localhost:5432' so that your server application can connect on the database.
  Enter the backend folder on terminal and run:

  🇧🇷 Certifique-se de fazer a conexão com o Postgres usando as credenciais do arquivo .env.
  Além disso, altere o valor de DATABASE_URL de 'db:5432' para 'localhost:5432', para que sua aplicação possa se conectar ao banco de dados.
  Entre na pasta do backend pelo terminal e execute:

  ##### `npm install` to install the dependencies / para instalar as dependencias.
  ##### `npx prisma migrate dev` to make the database / para criar o banco de dados.
  ##### `npm start` to start the server on http://localhost:8080 / para iniciar o servidor na URL http://localhost:8080


  #### Frontend

  🇺🇸 Enter the frontend folder on CMD and just run `npm run dev`.
  
  🇧🇷 Entre na pasta frontend pelo terminal e simplesmente rode o comando `npm run dev`.

  
### Technologies / Tecnologias 🧰

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
