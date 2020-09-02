FROM node:lts-alpine

WORKDIR /app
COPY dist .
COPY package.json .

RUN npm i --only=prod

CMD node app.js