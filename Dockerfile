FROM node:alpine

ENV CHROME_BIN="/usr/bin/chromium-browser" \
  PUPPETEER_SKIP_CHROMIUM_DOWNLOAD="true"
    
RUN set -x \
  && apk update \
  && apk upgrade \
  # replacing default repositories with edge ones
  && echo "http://dl-cdn.alpinelinux.org/alpine/edge/testing" > /etc/apk/repositories \
  && echo "http://dl-cdn.alpinelinux.org/alpine/edge/community" >> /etc/apk/repositories \
  && echo "http://dl-cdn.alpinelinux.org/alpine/edge/main" >> /etc/apk/repositories \
  \
  # Add the packages
  && apk add --no-cache dumb-init curl make gcc g++ python linux-headers binutils-gold gnupg libstdc++ nss chromium

WORKDIR /build

RUN npm i -g yarn

COPY package.json .
COPY yarn.lock .

ENV NODE_ENV production

RUN yarn

COPY . .

CMD ["yarn", "start"]
