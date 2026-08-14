FROM node:20-alpine

WORKDIR /app

COPY . .

RUN npm install -g http-server

CMD ["http-server", "-p", "8080", "-c-1"]
