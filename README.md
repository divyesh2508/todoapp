# ToDo-app-node-js-express-js-mongodb

# first clone project on your PC
--> sudo git clone https://github.com/divyesh2508/todoapp.git

# Create docker network
--> sudo docker network create todoapp_network

# Create docker volume
--> sudo docker volume create my-test-volume 

# create mongo container as follow command 
--> sudo docker run -d --network todoapp_network -v /var/lib/docker/volumes/my-test-volume/_data -p 28018:27017 -e MONGO_INITDB_ROOT_USERNAME=admin -e MONGO_INITDB_ROOT_PASSWORD=admin --hostname mongohost --restart always --name mongoserver4 mongo

# build mongo image from dockerfile
--> sudo docker build -t todo .

# create todoapp container as follow command
--> sudo docker run -d --network todoapp_network -p 3000:3000 --restart always --name todoserver todo

# Congratulation create successfully!

# Create using docker-compose file
--> docker compose up --build -d
