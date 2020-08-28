FROM node:lts-alpine

COPY dist .
COPY package.json .

RUN npm i

EXPOSE 9999

CMD node dist/main.js