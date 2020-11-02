FROM node:8-alpine


COPY ./package.json .

RUN rm -rf node_modules/
RUN npm update

RUN npm install

COPY . .

EXPOSE 4500

CMD node server.js