FROM node:lts-alpine

WORKDIR /avenant-api

RUN apk add --no-cache bash

COPY package.json package-lock.json ./
RUN npm install
RUN npm install -g @nestjs/cli

COPY . .
COPY .env .env

RUN dos2unix /avenant-api/entrypoint.sh && chmod +x /avenant-api/entrypoint.sh

RUN chown -R node:node /avenant-api
USER node

RUN npm run build && npx prisma generate

ENTRYPOINT ["/avenant-api/entrypoint.sh"]
