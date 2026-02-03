# Auth Platform

A full-stack authentication platform built with TypeScript, featuring a monorepo structure with backend and frontend services. The project includes user registration, login, email verification, 2FA support, session management, and user status management.

## Project Structure

```
auth-platform/
├── backend/          # Node.js/Express backend with TypeScript
├── frontend/         # Vue.js frontend with TypeScript
└── docker-compose.yml # Docker Compose configuration
```

## Prerequisites

Before running the project, ensure you have the following installed:

- **Docker** (version 20.10 or higher)
- **Docker Compose** (version 2.0 or higher)

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# JWT Secrets
JWT_ACCESS_SECRET=your-access-secret-key-here
JWT_REFRESH_SECRET=your-refresh-secret-key-here

# SMTP Configuration (for email verification)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASSWORD=your-email-password
SMTP_FROM=noreply@example.com
```

### Generating JWT Secrets

You can generate secure random strings for JWT secrets using:

```bash
# On Linux/Mac
openssl rand -base64 32

# On Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

## Quick Start

1. **Clone the repository** (if not already done):
   ```bash
   git clone <repository-url>
   cd auth-platform
   ```

2. **Create the `.env` file** in the root directory with your configuration (see Environment Variables section above).

3. **Start all services** using Docker Compose:
   ```bash
   docker-compose up -d
   ```

   This command will:
   - Build the backend and frontend Docker images
   - Start PostgreSQL database
   - Start the backend service
   - Start the frontend service
   - Run database migrations automatically

4. **Wait for services to be ready** (usually takes 30-60 seconds on first run).

5. **Access the application**:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001
   - API Health Check: http://localhost:3001/

## Services

### PostgreSQL Database
- **Port**: 5432
- **Database**: `auth_app`
- **Username**: `postgres`
- **Password**: `postgres`
- **Container**: `auth-postgres`

### Backend Service
- **Port**: 3001 (mapped from container port 3000)
- **Container**: `auth-backend`
- **API Endpoints**: `/api/auth/*`
- **Health Check**: `GET /`

### Frontend Service
- **Port**: 5173
- **Container**: `auth-frontend`
- **Development Server**: Vite dev server

## Docker Commands

### Start services
```bash
docker-compose up -d
```

### Stop services
```bash
docker-compose down
```

### View logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Rebuild services (after code changes)
```bash
docker-compose up -d --build
```

### Stop and remove volumes (clean database)
```bash
docker-compose down -v
```

## Development

### Running Backend Locally (without Docker)

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables in `.env` file (same as root `.env`).

4. Generate Prisma client:
   ```bash
   npx prisma generate
   ```

5. Run database migrations:
   ```bash
   npx prisma migrate deploy
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```

### Running Frontend Locally (without Docker)

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Features

- ✅ User registration with email verification
- ✅ User login with JWT tokens (access + refresh)
- ✅ Email verification via SMTP
- ✅ Two-Factor Authentication (2FA) with QR code
- ✅ Session management
- ✅ User status management (active, blocked, pending)
- ✅ Rate limiting
- ✅ Security headers (Helmet)
- ✅ Full TypeScript support (no `any` types)
- ✅ Prisma ORM with PostgreSQL

## API Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-email` - Verify email with token
- `POST /api/auth/resend-verification` - Resend verification email
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout (invalidate refresh token)
- `GET /api/auth/sessions` - Get user sessions (requires auth)
- `DELETE /api/auth/sessions/:id` - Delete specific session (requires auth)
- `POST /api/auth/2fa/enable` - Enable 2FA (requires auth)
- `POST /api/auth/2fa/verify` - Verify 2FA code
- `POST /api/auth/2fa/disable` - Disable 2FA (requires auth)

## Troubleshooting

### Services won't start
- Check if ports 3001, 5173, and 5432 are available
- Verify Docker and Docker Compose are running
- Check logs: `docker-compose logs`

### Database connection errors
- Ensure PostgreSQL container is healthy: `docker-compose ps`
- Wait for database to be ready (healthcheck may take a few seconds)
- Check database logs: `docker-compose logs postgres`

### Email not sending
- Verify SMTP credentials in `.env` file
- Check SMTP server allows connections from your IP
- Review backend logs for SMTP errors: `docker-compose logs backend`

### Frontend can't connect to backend
- Verify backend is running: `curl http://localhost:3001/`
- Check `VITE_API_URL` in frontend environment (default: `http://localhost:3000/api`)
- Ensure both services are on the same Docker network

## License

ISC

