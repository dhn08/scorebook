import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
const app = express();
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  }),
);
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());
//routes import
import scoreRouter from "./routes/score.routes.js";
import { upload } from "./middlewares/multer.middleware.js";

//routes declaration
app.use("/api/v1/score", upload.single("file"), scoreRouter);

export { app };
