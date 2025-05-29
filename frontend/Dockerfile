FROM node:lts-alpine

WORKDIR /avenant-web

COPY package.json package-lock.json /avenant-web/

RUN npm i 

COPY . /avenant-web/

RUN npm run build

EXPOSE 5173

CMD ["npm", "run", "dev"]