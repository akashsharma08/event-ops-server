import app from "./app";
import { ensureAuthSchema } from "./config/schema-bootstrap";

const PORT = process.env.PORT || 5000;

ensureAuthSchema()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to apply auth schema bootstrap:", err);
    process.exit(1);
  });