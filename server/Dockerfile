FROM node:22-alpine
WORKDIR /app
COPY config.mjs blizzard.mjs recrutement.mjs server.mjs ./
USER node
EXPOSE 8080
CMD ["node", "server.mjs"]
