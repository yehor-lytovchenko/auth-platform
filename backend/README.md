# Backend Documentation

## Architecture and Technology Stack

### Core Technologies

- **Node.js + Express** - REST API server
- **TypeScript** - type safety
- **PostgreSQL** - database
- **Prisma** - ORM for database operations
- **Docker** - database containerization

### Security

- **bcrypt** - password hashing
- **jsonwebtoken** - JWT tokens (access + refresh)
- **helmet** - HTTP security headers
- **express-rate-limit** - DDoS and brute-force protection
- **speakeasy** - 2FA (TOTP)

### Email

- **nodemailer** - email sending
- **handlebars** - email templates

---

## Implemented Features (Step by Step)

### STEP 1-3: Environment Setup and Database

- Docker-compose for PostgreSQL
- Prisma ORM, migrations
- Database connection

## Environment Setup

Copy `.env.example` to `.env` in the backend folder:

```bash
cd backend
cp .env.example .env
```

### STEP 4: User Registration

- Endpoint: `POST /api/auth/register`
- Email/password validation
- **Password requirements:**
  - Minimum 8 characters
  - At least one uppercase letter (A-Z)
  - At least one lowercase letter (a-z)
  - At least one number (0-9)
- Password hashing (bcrypt)
- Saving to database

### STEP 5: Authorization (JWT)

- Endpoint: `POST /api/auth/login`
- Access (15 min) + refresh (7 days) token generation
- Middleware for token verification

### STEP 6: Multi-device Sessions

- Sessions table in database
- Storing refresh tokens with device info and IP
- `GET /api/auth/sessions` - list active sessions
- `DELETE /api/auth/sessions/:id` - logout from specific device

### STEP 7: Email Verification

- Verification token generation (crypto)
- Email sending with link (nodemailer + handlebars)
- `GET /api/auth/verify-email?token=...` - email confirmation
- Update `emailVerified` status

### STEP 8: 2FA (Two-Factor Authentication)

- `POST /api/auth/2fa/generate` - QR code generation (speakeasy + qrcode)
- `POST /api/auth/2fa/enable` - enable 2FA with code verification
- 2FA code verification on login (TOTP algorithm)

### STEP 9: Status System

- Status enum: active, blocked, deleted, pending_verification
- Middleware for status checking before API access
- Extensible system (easy to add new statuses)

### STEP 10: Security

- **helmet** - CSP, X-Frame-Options, HSTS and other headers
- **Rate limiting**:
  - 5 login/register attempts per 15 minutes
  - 100 general requests per 15 minutes
- **CORS** - allowed origins configuration

---

## Project Structure

```
backend/
├── prisma/
│   ├── migrations/      # Database change history
│   └── schema.prisma    # Database schema
├── src/
│   ├── controllers/     # Business logic
│   ├── middleware/      # Auth, rate limiting, status checks
│   ├── routes/          # API endpoints
│   ├── templates/       # Email templates (handlebars)
│   ├── types/           # TypeScript types
│   ├── utils/           # Email utilities
│   ├── db.ts            # Prisma client
│   └── server.ts        # Entry point
├── .env                 # Environment variables
└── package.json
```

---

## How Authentication Works

### JWT Tokens

1. **Access token** (15 min) - for accessing protected endpoints
2. **Refresh token** (7 days) - for refreshing access token

### Multi-device Support

- Refresh tokens stored in database with device binding
- View all active sessions
- Logout from specific device

### 2FA (TOTP)

- Uses Time-based One-Time Password algorithm
- Shared secret key stored in database and on phone
- Code generated independently on server and in Google Authenticator
- Time synchronization (codes refresh every 30 seconds)

---

## How to Add a New Endpoint

1. Create function in `controllers/`
2. Add route in `routes/`
3. Add middleware if needed (auth, status check)

Example:

```typescript
// controllers/userController.ts
export const getProfile = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const userId = req.userId!;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  res.json(user);
};

// routes/userRoutes.ts
router.get("/profile", authMiddleware, checkUserStatus, getProfile);
```

---

## Working with Migrations

### Create new migration

```bash
npx prisma migrate dev --name migration_name
```

### Apply migrations

```bash
npx prisma migrate deploy
```

### Generate Prisma Client

```
npx prisma generate
```

### Open Prisma Studio

```bash
npx prisma studio
```

## Technology Choices and Justification

### Why Express?

**Problem:** Need a lightweight, flexible REST API framework  
**Solution:** Express is minimalist, has huge ecosystem, perfect for microservices architecture. Nest would be overkill for such a task.

### Why Prisma ORM?

**Problem:** Raw SQL is error-prone, migration management is complex  
**Solution:** Prisma provides type-safe database access, automatic migrations, and excellent TypeScript integration. Better DX than TypeORM or MikroORM for this use case.

### Why bcrypt?

**Problem:** Plain text passwords = security disaster.  
**Solution:** bcrypt is a standard for password hashing.

### Why JWT (jsonwebtoken)?

**Problem:** Need stateless authentication for scalability  
**Solution:** JWT tokens are self-contained, work across multiple servers, support refresh token rotation.

### Why helmet?

**Problem:** Default Express is vulnerable to common web attacks  
**Solution:** Helmet sets 15+ HTTP security headers (CSP, HSTS, X-Frame-Options, etc.) protecting against XSS, clickjacking, MIME-sniffing attacks.

### Why express-rate-limit?

**Problem:** Brute-force attacks and DDoS can overwhelm the server  
**Solution:** Rate limiting blocks excessive requests from single IP. 5 login attempts per 15 min prevents password guessing. 100 requests/15min prevents resource exhaustion.

### Why speakeasy (2FA)?

**Problem:** Passwords alone can be stolen/phished  
**Solution:** TOTP-based 2FA adds second factor (something you have - phone). Even with stolen password, attacker can't login without time-based code from Google Authenticator.

### Why nodemailer?

**Problem:** Need to send verification emails  
**Solution:** Nodemailer is the most popular Node.js email library, supports all SMTP providers, has TypeScript support.

### Why handlebars?

**Problem:** Writing HTML emails in strings is unmaintainable  
**Solution:** Handlebars provides clean templates with variables (`{{email}}`, `{{link}}`), separates markup from logic, and simplifies changing the design of emails.
