import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { prisma } from "./db";
import authRoutes from "./routes/authRoutes";
import helmet from "helmet";
import { generalLimiter } from "./middleware/rateLimiter";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy for rate limiting behind Render's load balancer
app.set('trust proxy', true);

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(generalLimiter);

app.use("/api/auth", authRoutes);

app.get("/", async (req, res) => {
  try {
    await prisma.$connect();
    res.json({ message: "Backend works! DB connected!" });
  } catch (error) {
    res.status(500).json({ message: "DB connection failed" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
