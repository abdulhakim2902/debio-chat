FROM node:20.16.0-slim AS dependencies
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --network-timeout 100000

FROM node:20.16.0-slim AS builder
ARG VCS_REF
WORKDIR /app
COPY . .
COPY --from=dependencies /app/node_modules ./node_modules
ENV NEXT_PUBLIC_APP_BUILD_ID=${VCS_REF}
RUN yarn build \
  && yarn install --production --prefer-offline --network-timeout 100000

FROM node:20.16.0-slim AS runner
ARG VCS_REF
LABEL network.debio.image.authors="dev@debio.network"
RUN useradd -m -u 1001 -U -s /bin/sh -d /home/debio debio
WORKDIR /app
COPY --from=builder /app/next.config.mjs ./next.config.mjs
COPY --from=builder --chown=debio /app/public ./public
COPY --from=builder --chown=debio /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
USER debio
ENV NEXT_PUBLIC_APP_BUILD_ID=${VCS_REF} NODE_ENV=production HOST=0.0.0.0 PORT=3100
EXPOSE ${PORT}
ENTRYPOINT ["yarn", "start"]
