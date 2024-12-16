# Building layer
FROM node:22.12.0-alpine AS base

WORKDIR /app

COPY tsconfig*.json ./
COPY package*.json ./
COPY apps/ apps/
COPY libs/ libs/
COPY nx.json nx.json
COPY jest.config.ts jest.config.ts
COPY eslint.config.js ./eslint.config.js
COPY jest.preset.js ./jest.preset.js

RUN apk add --update python3 make g++\
    && rm -rf /var/cache/apk/* \
    && npm install

RUN node_modules/.bin/nx build probation-app --configuration=production --verbose

# Runtime layer
FROM node:22.12.0-alpine AS production

ENV APP_PORT=3000

WORKDIR /app

COPY package*.json ./
COPY --from=base /app/dist/ ./dist/

RUN apk add --update python3 make g++ \
    && rm -rf /var/cache/apk/* \
    && npm install --omit=dev

EXPOSE $APP_PORT
CMD [ "node", "dist/apps/probation-app/main.js" ]

