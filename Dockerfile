ARG NODE_VERSION
FROM node:${NODE_VERSION}

RUN mkdir /service
WORKDIR /service

COPY package.json .
COPY package-lock.json .
RUN npm install

COPY lib lib
COPY google-cloud-metrics google-cloud-metrics
COPY kafka kafka
COPY postgres postgres