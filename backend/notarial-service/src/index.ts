import express from "express";

const app = express();
const PORT = process.env.PORT || 3002;

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({
    success: true,
    data: { status: "healthy", service: "notarial-service", version: "0.1.0" },
  });
});

// TODO: CRUD for notarial register entries (Rule VI compliance)
// TODO: Auto-numbering (entry_number, page_number)
// TODO: Weekly certification generation (Rule VI, Sec. 2(g))
// TODO: Monthly Clerk of Court report generation (Rule VI, Sec. 2(h))
// TODO: Disqualification checker (Rule IV, Sec. 3)
// TODO: Commission renewal alerts (Rule III, Sec. 13 - 45 days before expiry)
// TODO: IEN/REN support for 2025 E-Notarization Rules (A.M. No. 24-10-14-SC)

app.listen(PORT, () => {
  console.log(`Notarial Service running on port ${PORT}`);
});
