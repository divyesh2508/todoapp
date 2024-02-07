## Project Title : Dockerize Node-ToDo Application 

## About Project:
The objective of this project is to design and deploy a multi-service application using Docker containers. The application consists of two services: MongoDB for data storage and a Node.js/Express backend for a todo list application. The backend provides CRUD operations to manage tasks and connects to MongoDB using secure credentials within a Docker network.

## Commands for Run the Project

## First clone project on your PC
 `sudo git clone https://github.com/divyesh2508/todoapp.git`

## Create docker network
 `sudo docker network create todoapp_network`

## Create docker volume
 `sudo docker volume create my-test-volume` 

## Create mongo container as follow command 
 `sudo docker run -d --network todoapp_network -v /var/lib/docker/volumes/my-test-volume/_data -p 28018:27017 -e MONGO_INITDB_ROOT_USERNAME=admin -e MONGO_INITDB_ROOT_PASSWORD=admin --hostname mongohost --restart always --name mongoserver4 mongo`

## Build mongo image from dockerfile
 `sudo docker build -t todo .`

## Create todoapp container as follow command
 `sudo docker run -d --network todoapp_network -p 3000:3000 --restart always --name todoserver todo`

## Create using docker-compose file
 `docker compose up --build -d`

## Connect the website using 3000 port
`http://localhost:3000/`
 
