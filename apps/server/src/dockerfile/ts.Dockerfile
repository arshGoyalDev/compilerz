FROM node:24-alpine

RUN npm install -g typescript

WORKDIR /app

CMD ["/bin/sh"]
