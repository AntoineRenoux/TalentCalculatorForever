# API de l'armurerie (TypeScript compilé). Contexte de construction : la racine du projet
#   docker build -f server/Dockerfile .
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json tsconfig* ./
COPY config/ config/
COPY server/ server/
RUN npm ci
RUN npx tsc -p server/tsconfig.json

# Exécution : uniquement le JS compilé (le serveur n'a aucune dépendance).
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
# package.json pour "type": "module" (les fichiers compilés sont des modules ES).
COPY --from=build /app/package.json ./
COPY --from=build /app/server/dist ./server/dist
USER node
EXPOSE 8080
CMD ["node", "server/dist/server/src/server.js"]
