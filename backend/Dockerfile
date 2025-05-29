FROM node:lts-alpine

WORKDIR /avenant-api

RUN apk add --no-cache bash

COPY package.json package-lock.json ./

RUN npm install

RUN npm install -g @nestjs/cli

COPY . .

RUN chown -R node:node /avenant-api

USER node

RUN npm run build && npx prisma generate

EXPOSE 8080

CMD ["npm", "run", "start:prod"]
