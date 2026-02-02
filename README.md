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

## Technology Choices and Justification

### Backend Technologies

#### Express.js
**Problem:** Need a lightweight, flexible REST API framework for authentication platform  
**Solution:** Express is minimalist, has huge ecosystem, perfect for microservices architecture. Provides excellent middleware support for authentication, rate limiting, and security headers. NestJS would be overkill for this task.

#### Prisma ORM
**Problem:** Raw SQL is error-prone, migration management is complex, need type-safe database access  
**Solution:** Prisma provides type-safe database access, automatic migrations, and excellent TypeScript integration. Better developer experience than TypeORM or MikroORM for this use case. Ensures database schema matches TypeScript types at compile time.

#### PostgreSQL
**Problem:** Need reliable, ACID-compliant database for sensitive user data  
**Solution:** PostgreSQL is production-ready, supports complex queries, has excellent performance, and provides strong data integrity guarantees. Perfect for storing user credentials, sessions, and authentication tokens.

#### bcrypt
**Problem:** Plain text passwords = security disaster  
**Solution:** bcrypt is industry standard for password hashing. Uses adaptive hashing algorithm that automatically increases computational cost, making brute-force attacks impractical even as hardware improves.

#### JWT (jsonwebtoken)
**Problem:** Need stateless authentication for scalability across multiple servers  
**Solution:** JWT tokens are self-contained, work across multiple servers without shared session storage, support refresh token rotation. Enables horizontal scaling and multi-device sessions.

#### Helmet
**Problem:** Default Express is vulnerable to common web attacks (XSS, clickjacking, MIME-sniffing)  
**Solution:** Helmet sets 15+ HTTP security headers (CSP, HSTS, X-Frame-Options, etc.) protecting against XSS, clickjacking, MIME-sniffing attacks. Essential for production security.

#### express-rate-limit
**Problem:** Brute-force attacks and DDoS can overwhelm the server, especially from multiple geolocations  
**Solution:** Rate limiting blocks excessive requests from single IP. 5 login attempts per 15 min prevents password guessing. 100 requests/15min prevents resource exhaustion. For production, can be extended with Redis for distributed rate limiting across multiple servers.

#### speakeasy (2FA)
**Problem:** Passwords alone can be stolen/phished  
**Solution:** TOTP-based 2FA adds second factor (something you have - phone). Even with stolen password, attacker can't login without time-based code from Google Authenticator. Industry standard for two-factor authentication.

#### nodemailer + handlebars
**Problem:** Need to send verification emails with professional templates  
**Solution:** Nodemailer is the most popular Node.js email library, supports all SMTP providers. Handlebars provides clean templates with variables, separates markup from logic, simplifies changing email design.

### Frontend Technologies

#### Vue.js 3
**Problem:** Need a reactive, component-based UI framework  
**Solution:** Vue 3 offers Composition API for better code organization, excellent TypeScript support, and smaller bundle size than Vue 2. Easier learning curve than React for this project scale. Progressive framework allows incremental adoption.

#### PrimeVue
**Problem:** Need professional UI components quickly without building from scratch  
**Solution:** Comprehensive component library (80+ components) with built-in accessibility, theming system, and responsive design. Saves development time, ensures consistent UI/UX, and meets requirement for component library usage.

#### TypeScript
**Problem:** JavaScript's dynamic typing causes runtime errors, difficult to maintain large codebases  
**Solution:** Compile-time type checking, better IDE support, prevents common bugs. Mandatory for assignment requirements. Ensures type safety across frontend and backend.

#### Vite
**Problem:** Slow development server and build times with traditional bundlers  
**Solution:** Vite provides instant server start, lightning-fast HMR (Hot Module Replacement), and optimized production builds. Native ES modules in development. Significantly improves developer experience.

#### Pinia
**Problem:** Need centralized state management for authentication tokens and user data  
**Solution:** Official Vue state management (replaces Vuex). Simpler API, better TypeScript inference, modular store design. Perfect for auth token management and session state.

#### Axios
**Problem:** Need HTTP client with request/response transformation and interceptors  
**Solution:** Interceptors allow automatic token injection and refresh logic. Better error handling than fetch API. Widely adopted standard for Vue apps. Enables seamless token refresh on 401 errors.

### Infrastructure Technologies

#### Docker + Docker Compose
**Problem:** Need consistent development and production environments, easy deployment  
**Solution:** Docker containerizes all services (PostgreSQL, backend, frontend). Docker Compose orchestrates multi-container setup. Ensures "works on my machine" problem is eliminated. Simplifies deployment and scaling.

#### Docker Network
**Problem:** Services need to communicate securely within containerized environment  
**Solution:** Docker bridge network isolates services while allowing inter-service communication. Backend can connect to PostgreSQL using service name instead of IP address.

## Security Measures

### Protection Against Hacker Attacks

1. **Password Security**: bcrypt hashing with salt rounds prevents rainbow table attacks
2. **JWT Tokens**: Short-lived access tokens (15 min) limit exposure window
3. **Helmet**: HTTP security headers protect against XSS, clickjacking, MIME-sniffing
4. **Input Validation**: Server-side validation prevents injection attacks
5. **2FA**: TOTP-based two-factor authentication adds additional security layer
6. **Session Management**: Refresh tokens stored in database with device/IP tracking

### Protection Against DDoS Attacks

1. **Rate Limiting**: 
   - 5 login/register attempts per 15 minutes (prevents brute-force)
   - 100 general requests per 15 minutes (prevents resource exhaustion)
2. **Express Rate Limit**: In-memory rate limiting for single-server deployments
3. **Future Enhancement**: Can be extended with Redis for distributed rate limiting across multiple servers/geolocations

**Note:** For production deployment with high traffic, consider:
- Redis-based distributed rate limiting
- CDN (Cloudflare) for DDoS protection
- Load balancer with rate limiting
- IP-based blocking and geolocation filtering

## License

ISC

