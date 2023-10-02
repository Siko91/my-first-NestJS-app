FROM node:18

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY nest*.json ./
COPY tsconfig*.json ./
COPY src src

# Skipping .env files

RUN npm run build

CMD ["/bin/bash", "-c", "npm run migrations:run; node dist/main.js"]