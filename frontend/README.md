Architecture and Technology Stack
Core Technologies

Vue 3 - Progressive JavaScript framework
TypeScript - Type safety and better developer experience
Vite - Fast build tool and development server
Vue Router - Client-side routing
Pinia - State management

UI Library

PrimeVue - Comprehensive UI component library
PrimeIcons - Icon set for PrimeVue

HTTP Client

Axios - Promise-based HTTP client with interceptors

Implemented Features (Step by Step)
STEP 1-2: Project Setup and PrimeVue Configuration

Vue 3 project initialization with TypeScript
PrimeVue installation and theme configuration (Aura)
Global component registration
PrimeIcons setup

STEP 3: API Service

Axios instance with base URL configuration
Request interceptor: automatically adds access token to headers
Response interceptor: handles 401 errors and token refresh
Automatic redirect to login on authentication failure

STEP 4: Auth Store (Pinia)

Centralized authentication state management
Methods: login(), register(), logout()
Token storage in localStorage
Access and refresh token management

STEP 5: Registration Page

Form: email and password inputs
Client-side validation
Password requirements display
Error handling with Toast notifications
Redirect to login after successful registration

STEP 6: Login Page

Form: email, password, and optional 2FA code
Conditional 2FA input (shows when 2FA is enabled)
Token storage after successful login
Redirect to Dashboard

STEP 7: Router and Guards

Route configuration with meta fields
requiresAuth guard: protects authenticated routes
requiresGuest guard: prevents authenticated users from accessing login/register
Automatic redirects based on authentication state

STEP 8: Dashboard

Welcome screen after login
Navigation buttons to Sessions and Settings
Logout functionality
Clean, centered card layout

STEP 9: Sessions Management

DataTable displaying active sessions
Columns: Device, IP Address, Created At
Logout button for each session
Auto-refresh after session deletion
Handles edge case: logout when all sessions deleted

STEP 10: Settings Page

Enable 2FA:

Generate QR code button
Modal dialog with QR code display
6-digit code input for verification
Integration with Google Authenticator

Delete Account:

Confirmation dialog
Complete account deletion
Auto-logout and redirect to login

STEP 11: Toast Notifications

Global Toast component in App.vue
Success notifications (green)
Error notifications (red)
3-second auto-dismiss
Used across all features

STEP 12: TypeScript Types

User interface
Session interface
LoginResponse interface
ApiErrorResponse interface
No any types used (strict typing)

Project Structure
frontend/
├── src/
│ ├── assets/ # Static assets (CSS, images)
│ ├── components/ # Reusable Vue components
│ ├── router/ # Vue Router configuration
│ │ └── index.ts # Routes and guards
│ ├── services/ # API services
│ │ └── api.ts # Axios instance with interceptors
│ ├── stores/ # Pinia stores
│ │ └── authStore.ts # Authentication state
│ ├── types/ # TypeScript interfaces
│ │ └── index.ts # Shared types
│ ├── views/ # Page components
│ │ ├── LoginView.vue
│ │ ├── RegisterView.vue
│ │ ├── DashboardView.vue
│ │ ├── SessionsView.vue
│ │ └── SettingsView.vue
│ ├── App.vue # Root component
│ └── main.ts # Application entry point
├── .env # Environment variables
└── package.json

Technology Choices and Justification
Why Vue 3?
Problem: Need a reactive, component-based UI framework
Solution: Vue 3 offers Composition API for better code organization, excellent TypeScript support, and smaller bundle size than Vue 2. Easier learning curve than React for this project scale.
Why TypeScript?
Problem: JavaScript's dynamic typing causes runtime errors
Solution: Same as backend - compile-time type checking, better IDE support, prevents common bugs. Mandatory for TZ requirements.
Why Vite?
Problem: Slow development server and build times with Webpack
Solution: Vite provides instant server start, lightning-fast HMR (Hot Module Replacement), and optimized production builds. Native ES modules in development.
Why Vue Router?
Problem: Need client-side routing for SPA
Solution: Official Vue.js router with navigation guards, dynamic routes, and excellent TypeScript support. Enables protected routes without page reloads.
Why Pinia?
Problem: Need centralized state management for auth
Solution: Official Vue state management (replaces Vuex). Simpler API, better TypeScript inference, modular store design. Perfect for auth token management.
Why PrimeVue?
Problem: Need professional UI components quickly
Solution: Comprehensive component library (80+ components) with built-in accessibility, theming system, and responsive design. Saves development time vs building from scratch. Required by TZ to use component library.
Why Axios?
Problem: Need HTTP client with request/response transformation
Solution: Interceptors allow automatic token injection and refresh logic. Better error handling than fetch API. Widely adopted standard for Vue apps.

How Authentication Works
Token Management

Login Flow:

User submits credentials → API returns accessToken + refreshToken
Tokens stored in localStorage and Pinia store
Axios interceptor adds Authorization: Bearer <token> to all requests

Token Refresh:

When access token expires (401 error) → Axios interceptor catches it
Sends refresh token to /auth/refresh endpoint
Gets new access token → Updates localStorage
Retries original request automatically

Logout:

Calls /auth/logout endpoint (clears server sessions)
Removes tokens from localStorage and Pinia
Redirects to login page

Route Guards
typescriptrouter.beforeEach((to, from, next) => {
const isAuthenticated = !!authStore.accessToken

if (to.meta.requiresAuth && !isAuthenticated) {
next('/login') // Redirect unauthenticated users
} else if (to.meta.requiresGuest && isAuthenticated) {
next('/dashboard') // Redirect authenticated users away from login
} else {
next() // Allow navigation
}
})
2FA Integration

Generate endpoint creates QR code → User scans with Google Authenticator
Enable endpoint verifies first code → Activates 2FA for account
Login page conditionally shows 2FA input field
Backend validates TOTP code before issuing tokens

How to Add a New Page

Create component in src/views/NewPageView.vue
Add route in src/router/index.ts:

typescript{
path: '/new-page',
name: 'newPage',
component: () => import('@/views/NewPageView.vue'),
meta: { requiresAuth: true }, // or requiresGuest
}

Import PrimeVue components locally in the page
Use apiClient for API calls
Use useToast() for notifications

Environment Variables
Create .env file:
envVITE_API_URL=http://localhost:3000/api
Access in code:
typescriptimport.meta.env.VITE_API_URL

Development Commands
Install dependencies
bashnpm install
Run development server
bashnpm run dev
Build for production
bashnpm run build
Type checking
bashnpm run type-check
Linting
bashnpm run lint
