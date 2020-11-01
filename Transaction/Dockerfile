FROM node:8-alpine


COPY ./package.json .

RUN npm install

COPY . .

EXPOSE 9500

CMD npm start