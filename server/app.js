import express from "express";
import cors from "cors";
import { config } from "dotenv";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import path from "path";
import { fileURLToPath } from "url";
import { errorMiddleware } from "./middlewares/error.js";
import authRouter from "./router/userRoutes.js";
import projectRouter from "./router/projectRoutes.js";

config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors({
  origin: [process.env.FRONTED_URL],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(fileUpload({
  useTempFiles: false,
  limits: { fileSize: 20 * 1024 * 1024 },
}));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/projects", projectRouter);
app.use(errorMiddleware);

export default app;
