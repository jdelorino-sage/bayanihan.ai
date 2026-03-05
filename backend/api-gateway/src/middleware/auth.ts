import { Request, Response, NextFunction } from "express";

/**
 * Clerk JWT verification middleware.
 * TODO: Integrate with @clerk/express when Clerk is configured.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Authentication required",
      },
    });
    return;
  }

  // TODO: Verify Clerk JWT
  // const token = authHeader.split(' ')[1];
  // const session = await clerkClient.verifyToken(token);

  next();
}
