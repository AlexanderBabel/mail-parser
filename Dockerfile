FROM node:alpine

WORKDIR /app

COPY package.json .
COPY yarn.lock .

ENV NODE_ENV production

RUN yarn

COPY src .

CMD ["yarn", "start"]
