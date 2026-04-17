import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import authRoutes from "./modules/auth/auth.routes";
const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});
app.use("/api/auth", authRoutes);

export default app;