FROM node:10.20.1-alpine3.11 As dev

WORKDIR /usr/src/app

RUN apk add --no-cache bash curl

COPY package*.json ./

RUN npm install --silent

COPY . .

RUN npm run build
