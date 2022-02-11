FROM node:12

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY bin ./bin/
COPY model ./model/
COPY views ./views/
COPY public ./public/
COPY routes ./routes/
COPY app.js ./
RUN mkdir vehicles
VOLUME ./vehicles


EXPOSE 3000

CMD ["node", "./bin/www"]