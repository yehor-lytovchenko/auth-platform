FROM node:20-alpine

# Install OpenSSL, netcat and other dependencies for Prisma
RUN apk add --no-cache openssl libc6-compat netcat-openbsd

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npx prisma generate

EXPOSE 3000

# Wait for database to be ready, then run migrations and start server
CMD ["sh", "-c", "until nc -z postgres 5432; do sleep 1; done && npx prisma migrate deploy && npm run dev"]