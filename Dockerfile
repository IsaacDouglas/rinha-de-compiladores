FROM node:20
WORKDIR /app

COPY index.js .
COPY src src
COPY files/source.rinha.json /var/rinha/source.rinha.json

CMD node index.js