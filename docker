FROM node:23-alpine

RUN mkdir -p /api/node_modules && chown -R node:node /api

WORKDIR /api

USER node

COPY --chown=node:node . .
RUN npm install --force
RUN npm run build
RUN mkdir -p dist/docs && cp src/docs/apispec.yml dist/docs/

ENV NODE_ENV="production"

EXPOSE 3000

CMD [ "node", "dist/index.js" ]