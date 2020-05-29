FROM node:alpine

copy ./package.json .

RUN npm install

COPY . .

EXPOSE 8000

CMD npm start