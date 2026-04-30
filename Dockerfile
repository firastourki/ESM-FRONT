# ── Stage 1: Build ───────────────────────────────────────────────────────────
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .

# Inject backend URL at build time.
# In Coolify: set API_URL as a Build Variable.
# In Jenkins:  passed via --build-arg API_URL=...
ARG API_URL=http://localhost:8080
RUN sed -i "s|__API_URL__|${API_URL}|g" src/environments/environment.prod.ts

RUN npm run build -- --configuration production

# ── Stage 2: Run (Angular SSR / Express) ─────────────────────────────────────
FROM node:20-alpine AS production
WORKDIR /app

COPY --from=build /app/dist/edutest ./dist/edutest
COPY --from=build /app/package*.json ./

# Install only runtime dependencies — no devDeps, no Angular CLI
RUN npm install --omit=dev --legacy-peer-deps

EXPOSE 4000

CMD ["node", "dist/edutest/server/server.mjs"]
