FROM node
WORKDIR build
COPY src-repository/ ./src-repository
COPY webpack.config.js .
COPY package.json .
RUN npm i
RUN npm run compile-webpack

FROM node:lts-alpine
RUN apk --no-cache add ca-certificates
WORKDIR /app
COPY --from=0 /build/src-repository/dist/app.js .
CMD node app.js