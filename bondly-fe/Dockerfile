# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package.json .
COPY tsconfig.json .
COPY vite.config.ts .
COPY public ./public
COPY src ./src
COPY locales ./locales
RUN npm install && npm run build

# Production stage
FROM node:18-alpine AS prod
WORKDIR /app
RUN npm install -g serve
COPY --from=builder /app/dist ./dist
EXPOSE 4173
CMD ["serve", "-s", "dist", "-l", "4173"] 