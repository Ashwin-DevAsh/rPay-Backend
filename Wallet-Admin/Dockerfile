FROM node:alpine

COPY ./package.json .

RUN npm install

COPY . .

EXPOSE 4500

RUN node server.js