# This Dockerfile creates an image that allows for easy and iterative
# testing of code. It needs to be given bin, test and lib folders
# to run the code in situ

# By default use 6.12.0, but allow targeting specific versions
ARG NODE_VERSION=6.12.0
FROM node:$NODE_VERSION

RUN mkdir /app /app/bin && \
    chown -R node:node /app
USER node
WORKDIR /app

# Allow for custom registries 
ARG NPM_REGISTRY=https://registry.npmjs.com

COPY package*.json ./
RUN npm set registry ${NPM_REGISTRY} && \
    npm install && \
    npm cache clear --force

COPY .eslintrc.json config.json ./

VOLUME ["/app/bin/", "/app/test/", "/app/lib/"]

CMD npm run test:all
