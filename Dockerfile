# This is a Docker file for Fragments Front-end

# Stage 0 setting up
# Node version might be changed and it needs to be updated here
FROM node:16.15.1-bullseye@sha256:294ed7085d137d4f16fd97c0e1518f1d0386dd7fda7c4897d82c7ba65e15fdd6 AS build

# Metadta using LABLE "key=value" pairs for our image
LABEL miantainer="Atif Ali <aali309@myseneca.ca>" 
LABEL description="Fragments node.js microservice-ui"

ENV NODE_ENV=development

WORKDIR /site

COPY package.json package-lock.json ./ 
RUN npm install 

COPY . . 
RUN npm run build
#################################################################################################

# Stage 1 building and starting
FROM nginx:1.22.1-alpine@sha256:2366ede62d2e26a20f7ce7d0294694fe52b166107fd346894e4658dfb5273f9c AS deploy

# Copy the granted dependencies (node_modules)
COPY --from=build /site/dist /usr/share/nginx/html

# We run our service on port 80
EXPOSE 80

# Run a health check (Keep updating the AWS EC2 link everytime)
HEALTHCHECK --interval=15s --timeout=30s --start-period=10s --retries=3 \
    CMD curl localhost:8080 || exit 1