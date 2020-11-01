FROM node:alpine

COPY ./package.json .

RUN npm install

COPY . .

EXPOSE 8000

CMD npm start