FROM node:12-alpine


COPY ./package.json .

RUN npm install

COPY . .

EXPOSE 4500

CMD npm start