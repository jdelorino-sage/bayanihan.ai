import { Router } from "express";

export const healthRouter = Router();

healthRouter.get("/", (_req, res) => {
  res.json({
    success: true,
    data: {
      status: "healthy",
      service: "api-gateway",
      timestamp: new Date().toISOString(),
      version: "0.1.0",
    },
  });
});
