FROM node:14

WORKDIR /app

COPY package*.json ./

RUN npm install
RUN npm install -g sonarqube-scanner


COPY . .

EXPOSE 3000

CMD ["node", "app.js"]

