FROM node:lts-alpine

WORKDIR /avenant-api

RUN apk add --no-cache bash

COPY package.json package-lock.json ./

RUN npm install

RUN npm install -g @nestjs/cli

COPY . .

COPY .env .env

RUN chown -R node:node /avenant-api

COPY ./.docker/entrypoint.sh ./.docker/entrypoint.sh

RUN chmod +x ./.docker/entrypoint.sh

USER node

RUN npm run build && npx prisma generate

ENTRYPOINT ["./.docker/entrypoint.sh"]

