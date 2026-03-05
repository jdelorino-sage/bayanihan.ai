import express from "express";
import cors from "cors";
import helmet from "helmet";
import { healthRouter } from "./routes/health.js";
import { researchRouter } from "./routes/research.js";
import { errorHandler } from "./middleware/error.js";
import { rateLimiter } from "./middleware/rateLimit.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
  }),
);
app.use(express.json({ limit: "1mb" }));

// Rate limiting
app.use("/v1/", rateLimiter);

// Routes
app.use("/v1/health", healthRouter);
app.use("/v1/research", researchRouter);

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});

export default app;
