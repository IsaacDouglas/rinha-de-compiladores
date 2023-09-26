FROM node:20
WORKDIR /app

COPY index.mjs .
COPY src src
COPY var/rinha/source.rinha.json /var/rinha/source.rinha.json

CMD node index.mjs