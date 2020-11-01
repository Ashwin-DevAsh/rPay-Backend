FROM node:alpine

COPY ./package.json .

RUN npm install

COPY . .

EXPOSE 4500

CMD node server.js