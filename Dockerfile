FROM node:16-alpine

WORKDIR /app

COPY package*.json lerna.json tsconfig.json ./
COPY packages/backend ./packages/backend
COPY packages/frontend ./packages/frontend

RUN apk add --no-cache --virtual .build-deps alpine-sdk
RUN npx lerna bootstrap
RUN apk del .build-deps

RUN npm --prefix ./packages/backend run build
RUN npm --prefix ./packages/frontend run build:prod

COPY ./packages/frontend/web-build ./packages/backend/dist

COPY . .

EXPOSE 3000

CMD npm --prefix ./packages/backend run run