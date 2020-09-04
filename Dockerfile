FROM node:lts-alpine

RUN apk --no-cache add ca-certificates

WORKDIR /app
COPY dist .
COPY package.json .

RUN npm i --only=prod

CMD node app.js