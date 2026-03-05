import express from "express";

const app = express();
const PORT = process.env.PORT || 3003;

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({
    success: true,
    data: { status: "healthy", service: "auth-service", version: "0.1.0" },
  });
});

// TODO: Clerk webhook handler for user sync
// TODO: RBAC middleware (citizen, lawyer, notary, judge, admin)
// TODO: Stripe subscription management
// TODO: API key generation and validation
// TODO: Rate limit tier lookup

app.listen(PORT, () => {
  console.log(`Auth Service running on port ${PORT}`);
});
