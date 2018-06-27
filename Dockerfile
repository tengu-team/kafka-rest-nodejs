FROM node:10.5-alpine
RUN apk --no-cache add \
      bash \
      g++ \
      ca-certificates \
      lz4-dev \
      musl-dev \
      cyrus-sasl-dev \
      openssl-dev \
      make \
      python
RUN apk add --no-cache --virtual .build-deps gcc zlib-dev libc-dev bsd-compat-headers py-setuptools bash
RUN mkdir -p /usr/local/app
WORKDIR /usr/local/app
COPY package.json /usr/local/app
RUN npm install
COPY app.js /usr/local/app
USER node
CMD node app.js
EXPOSE 8082
