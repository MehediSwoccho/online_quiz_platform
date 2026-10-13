import "dotenv/config";
import app from "./app.js";
import { connectDB } from "./lib/db.js";

const port = Number.parseInt(process.env.PORT || "5001", 10);

try {
  await connectDB();
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
} catch {
  console.error("Failed to start server; check database configuration and availability.");
  process.exit(1);
}
