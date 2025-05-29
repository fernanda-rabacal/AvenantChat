FROM node:lts-alpine

WORKDIR /avenant-web

COPY package.json package-lock.json /avenant-web/

RUN npm i 

COPY . /avenant-web/

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "dev"]