FROM node:lts-alpine

WORKDIR /avenant-web

COPY package.json package-lock.json ./

RUN npm i 

COPY . .

RUN npm run build

EXPOSE 5173

CMD ["npm", "run", "start"]