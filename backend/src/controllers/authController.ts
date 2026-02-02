import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../db";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendVerificationEmail } from "../utils/email";
import speakeasy from "speakeasy";
import qrcode from "qrcode";
import { UserStatus } from "../types/userStatus";

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "Email and password required" });
      return;
    }

    if (password.length < 8) {
      res.status(400).json({ error: "Password must be at least 8 characters" });
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
      res.status(400).json({
        error:
          "Password must contain at least one uppercase letter, one lowercase letter, and one number",
      });
      return;
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      res.status(400).json({ error: "User already exists" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString("hex");

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        verificationToken,
        status: UserStatus.PENDING_VERIFICATION,
      },
    });

    await sendVerificationEmail(email, verificationToken);

    res.status(201).json({
      message: "User created. Check your email for verification.",
      user: {
        id: user.id,
        email: user.email,
        emailVerified: user.emailVerified,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, twoFaCode } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "Email and password required" });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    if (user.twoFaEnabled) {
      if (!twoFaCode) {
        res.status(400).json({ error: "2FA code required" });
        return;
      }

      const verified = speakeasy.totp.verify({
        secret: user.twoFaSecret!,
        encoding: "base32",
        token: twoFaCode,
      });

      if (!verified) {
        res.status(401).json({ error: "Invalid 2FA code" });
        return;
      }
    }

    const accessToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_ACCESS_SECRET!,
      { expiresIn: "15m" },
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: "7d" },
    );

    const deviceInfo = req.headers["user-agent"] || "Unknown";
    const ipAddress = req.ip || req.socket.remoteAddress || "Unknown";

    await prisma.session.create({
      data: {
        userId: user.id,
        refreshToken,
        deviceInfo,
        ipAddress,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    res.json({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

export const refreshToken = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({ error: "Refresh token required" });
      return;
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET!,
    ) as {
      userId: number;
    };

    const session = await prisma.session.findUnique({
      where: { refreshToken },
    });

    if (!session) {
      res.status(401).json({ error: "Invalid refresh token" });
      return;
    }

    const newAccessToken = jwt.sign(
      { userId: decoded.userId },
      process.env.JWT_ACCESS_SECRET!,
      { expiresIn: "15m" },
    );

    res.json({ accessToken: newAccessToken });
  } catch (error) {
    console.error(error);
    res.status(401).json({ error: "Invalid refresh token" });
  }
};

interface AuthRequest extends Request {
  userId?: number;
  params: {
    sessionId: string;
    [key: string]: string;
  };
}

export const getSessions = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = (req as AuthRequest).userId!;

    const sessions = await prisma.session.findMany({
      where: {
        userId,
        expiresAt: { gt: new Date() },
      },
      select: {
        id: true,
        deviceInfo: true,
        ipAddress: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ sessions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

export const logoutSession = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = (req as AuthRequest).userId!;
    const sessionId = parseInt((req as AuthRequest).params.sessionId);

    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      res.status(404).json({ error: "Session not found" });
      return;
    }
    if (session.userId !== userId) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    await prisma.session.delete({
      where: { id: sessionId },
    });

    res.json({ message: "Session deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

export const verifyEmail = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { token } = req.query;

    if (!token || typeof token !== "string") {
      res.status(400).json({ error: "Invalid token" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { verificationToken: token },
    });

    if (!user) {
      res.status(400).json({ error: "Invalid or expired token" });
      return;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationToken: null,
        status: UserStatus.ACTIVE,
      },
    });

    res.json({ message: "Email verified successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

export const generate2FA = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = (req as AuthRequest).userId!;

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      res.status(404).json({ error: "User not found" });
    }

    if (user?.twoFaEnabled) {
      res.status(400).json({ error: "2FA already enabled" });
      return;
    }

    const secret = speakeasy.generateSecret({
      name: `AuthApp (${user?.email})`,
    });

    await prisma.user.update({
      where: { id: userId },
      data: { twoFaSecret: secret.base32 },
    });

    const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url!);

    res.json({
      secret: secret.base32,
      qrCode: qrCodeUrl,
    });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

export const enable2FA = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as AuthRequest).userId!;
    const { code } = req.body;

    if (!code) {
      res.status(400).json({ error: "Code required" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.twoFaSecret) {
      res.status(400).json({ error: "2FA not set up" });
      return;
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFaSecret,
      encoding: "base32",
      token: code,
    });

    if (!verified) {
      res.status(400).json({ error: "Invalid code" });
      return;
    }

    await prisma.user.update({
      where: { id: userId },
      data: { twoFaEnabled: true },
    });

    res.json({ message: "2FA enabled successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

export const deleteAccount = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = (req as AuthRequest).userId!;

    await prisma.user.update({
      where: { id: userId },
      data: {
        status: UserStatus.DELETED,
        blocked: true,
      },
    });

    await prisma.session.deleteMany({
      where: { userId },
    });

    res.json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};
