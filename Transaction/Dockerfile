FROM node:12-alpine


COPY ./package.json .

RUN npm install

COPY . .

EXPOSE 9500

CMD node server.js