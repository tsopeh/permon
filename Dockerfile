# syntax=docker/dockerfile:1
FROM docker.io/node:18 AS build
WORKDIR /app
COPY package* yarn.lock ./
RUN yarn install
COPY . .
RUN yarn run build-demo

FROM docker.io/nginx:alpine
COPY --from=build /app/demo /usr/share/nginx/html
