FROM positivly/prisma-binaries:latest as prisma

#
# Builder stage.
# This state compile our TypeScript to get the JavaScript code
#
FROM node:22 AS builder

WORKDIR /usr/src/app

COPY . .

RUN curl -sfL https://gobinaries.com/tj/node-prune | bash -s -- -b /usr/local/bin

RUN yarn install --frozen-lockfile --silent --network-timeout 100000

RUN npx prisma generate

RUN yarn build

RUN yarn install --production --frozen-lockfile --silent && /usr/local/bin/node-prune && rm -rf src/

#
# Production stage.
# This state compile get back the JavaScript code from builder stage
# It will also install the production package only
#
FROM node:22-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV NODE_PATH=/app/dist/

## We just need the build to execute the command
COPY --from=builder /usr/src/app/. .

## uncomment following line, if you want to mount the templates folder
#COPY ./templates /app/templates

## uncomment following line, if you want to mount the public folder
#COPY ./public /app/public

# Set prisma environment:
ENV PRISMA_QUERY_ENGINE_BINARY=/prisma-engines/query-engine \
  PRISMA_MIGRATION_ENGINE_BINARY=/prisma-engines/migration-engine \
  PRISMA_INTROSPECTION_ENGINE_BINARY=/prisma-engines/introspection-engine \
  PRISMA_FMT_BINARY=/prisma-engines/prisma-fmt \
  PRISMA_CLI_QUERY_ENGINE_TYPE=binary \
  PRISMA_CLIENT_ENGINE_TYPE=binary
COPY --from=prisma /prisma-engines/query-engine /prisma-engines/migration-engine /prisma-engines/introspection-engine /prisma-engines/prisma-fmt /prisma-engines/

ENTRYPOINT [ "node" ]
CMD [ "dist/main.js" ]

EXPOSE 3000