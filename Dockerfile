FROM node:lts-alpine

WORKDIR /app
COPY dist .
COPY package.json .

RUN npm i

EXPOSE 9999

CMD node main.js