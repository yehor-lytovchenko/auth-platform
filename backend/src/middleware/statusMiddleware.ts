import { Request, Response, NextFunction } from "express";
import { prisma } from "../db";
import { UserStatus } from "../types/userStatus";

interface AuthRequest extends Request {
  userId?: number;
}

export const checkUserStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = (req as AuthRequest).userId;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { status: true, blocked: true },
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    if (user.status === UserStatus.DELETED) {
      res.status(403).json({ error: "Account is deleted" });
      return;
    }

    if (user.blocked) {
      res.status(403).json({ error: "Account is blocked" });
      return;
    }

    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};
