FROM seqalex/node

WORKDIR /build

RUN npm i -g yarn

COPY package.json .
COPY yarn.lock .

ENV NODE_ENV production

RUN yarn

COPY . .

CMD ["yarn", "start"]
