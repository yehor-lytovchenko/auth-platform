FROM node:20-alpine

# Install OpenSSL, netcat and other dependencies for Prisma
RUN apk add --no-cache openssl libc6-compat netcat-openbsd

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npx prisma generate
RUN npm run build

EXPOSE 3000

# Wait for database to be ready (based on DATABASE_URL host), run migrations, then start server
CMD ["sh", "-c", "DB_HOST=$(node -e \"console.log(new URL(process.env.DATABASE_URL).hostname)\") && until nc -z \"$DB_HOST\" 5432; do sleep 1; done && npx prisma migrate deploy && npm run start"]