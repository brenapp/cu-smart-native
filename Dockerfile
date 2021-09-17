FROM node:16-alpine

WORKDIR /app

COPY package*.json lerna.json tsconfig.json ./
COPY packages/backend ./packages/backend
COPY packages/frontend ./packages/frontend

RUN apk add --no-cache --virtual .build-deps alpine-sdk python2 unixodbc-dev
RUN npx lerna bootstrap
RUN apk del .build-deps

WORKDIR /app/packages/backend
RUN npm run build

WORKDIR /app/packages/frontend
RUN npm run build:prod

EXPOSE 3000

WORKDIR /app
COPY . .

ARG PROD=true

WORKDIR /app/packages/backend
CMD npm run run