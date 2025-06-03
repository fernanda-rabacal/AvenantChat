FROM node:lts-alpine

WORKDIR /avenant-web

COPY package.json package-lock.json ./

RUN npm i 

COPY . .

ENV VITE_API_URL=${VITE_API_URL}

RUN npm run build

EXPOSE 5173

CMD ["npm", "run", "start"]