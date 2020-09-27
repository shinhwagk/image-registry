FROM node
WORKDIR build
COPY src-repository/ ./src-repository
COPY webpack.config.js .
COPY package.json .
COPY tsconfig.json .
RUN npm i
RUN npm run compile-webpack

FROM node:14-alpine3.12
RUN apk --no-cache add ca-certificates
WORKDIR /app
EXPOSE 8000
COPY --from=0 /build/src-repository/dist/app.js .
CMD node app.js