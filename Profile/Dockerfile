FROM node:12-alpine


COPY ./package.json .

RUN npm install

COPY . .

EXPOSE 8000

CMD node index.js