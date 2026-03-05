import express from "express";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({
    success: true,
    data: { status: "healthy", service: "search-service", version: "0.1.0" },
  });
});

// TODO: Full-text + semantic search endpoints
// - Combined tsvector + pgvector queries
// - Faceted search: court, date range, topic, ponente, case type
// - Autocomplete/typeahead for case numbers and statute references

app.listen(PORT, () => {
  console.log(`Search Service running on port ${PORT}`);
});
