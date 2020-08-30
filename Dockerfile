FROM node:lts-alpine

WORKDIR /app
COPY dist .
COPY package.json .

RUN npm i --only=prod

EXPOSE 9999

CMD node app.js