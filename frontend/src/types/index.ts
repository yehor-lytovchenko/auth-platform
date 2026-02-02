export interface User {
  id: number
  email: string
  emailVerified: boolean
  twoFaEnabled: boolean
  status: string
}

export interface Session {
  id: number
  deviceInfo: string
  ipAddress: string
  createdAt: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  user: User
}

export interface ApiErrorResponse {
  response?: {
    status: number
    data?: {
      error: string
    }
  }
}

export interface RegisterPayload {
  email: string
  password: string
}

export interface LoginPayload {
  email: string
  password: string
  twoFaCode?: string
}

export interface RefreshTokenPayload {
  refreshToken: string
}

export interface RefreshTokenResponse {
  accessToken: string
}

export interface Generate2FAResponse {
  qrCode: string
}

export interface Enable2FAPayload {
  code: string
}

export interface SessionsResponse {
  sessions: Session[]
}
