# This is a Dockerfile: it defines a set of **instructions** used by the Docker Engine to create a Docker Image. 
# This Docker Image can be used to create a running Docker Container.
# Every `Dockerfile` must begin with a [`FROM` instruction].This specifies the parent (or _base_) image to use as a 
# starting point for our own image. Our `fragments` image will be _based_ on other Docker images.

FROM node:18.16.0 AS build

# Metadata about the image
LABEL maintainer="Atif Ali <aali309@myseneca.ca>"
LABEL description="Fragments node.js microservice"

ENV NODE_ENV=development

WORKDIR /site

COPY package.json package-lock.json ./ 
RUN npm install 

COPY . . 
RUN npm run build

# Stage 1 building and starting
FROM nginx:1.22.1-alpine@sha256:2366ede62d2e26a20f7ce7d0294694fe52b166107fd346894e4658dfb5273f9c AS deploy

# Copy the granted dependencies (node_modules)
COPY --from=build /site/dist /usr/share/nginx/html

# We run our service on port 80
EXPOSE 80