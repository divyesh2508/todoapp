FROM node:14

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["node", "app.js"]


# hello
# noew 
# sd
# saius
#ashdius
#sda
#s uad
# sadsadsa
# auisd
#sdssad
#uygsyu