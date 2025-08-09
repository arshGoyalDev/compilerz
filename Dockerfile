FROM node:22-alpine AS builder

WORKDIR /build

RUN apk add --no-cache python3 make g++ gcc

RUN npm install -g turbo pnpm

COPY *.json ./
COPY pnpm*.yaml ./
COPY apps/web/package*.json ./apps/web/
COPY apps/server/package*.json ./apps/server/

RUN pnpm install

COPY . .

RUN pnpm run build

# CMD ["/bin/sh"]

FROM docker:dind AS runner

RUN apk add --no-cache nodejs npm python3 make g++ gcc

WORKDIR /app

COPY --from=builder /build/apps/server/dist ./server
COPY --from=builder /build/apps/server/package.json ./server
COPY --from=builder /build/apps/server/src/dockerfile ./server/src/dockerfile
COPY --from=builder /build/apps/web/dist ./web/dist

ENV PORT=8000
ENV ORIGIN=http://localhost:3000
ENV VITE_SERVER_URL=http://localhost:8000

RUN cd ./server && npm install -prod
RUN cd ./web && npm install serve

RUN echo '{\
    "name": "web", \
    "version": "0.0.0", \
    "private": true, \
    "type": "module", \
    "scripts": { \
        "start": "npx serve -s dist -l 3000"\ 
    } \
}' > ./web/package.json

RUN npm install concurrently

RUN echo '{ \
    "name": "chatters", \
    \
    "version": "1.0.0", \
    \
    "private": true, \
    \
    "scripts": { \
        "start": "concurrently --kill-others --names \"SERVER,WEB\" --prefix-colors \"red,blue\" \"npm run start --workspace=server\" \"npm run start --workspace=web\"" \
    }, \
    \
    "devDependencies": { \
    \
    "concurrently": "^8.2.2" \
    }, \
    \
    "workspaces": [ \
        "web", \
        "server" \
    ], \
    "author": "arshGoyalDev", \
    "license": "MIT" \
}' > ./package.json


CMD ["npm", "run", "start"]