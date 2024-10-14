import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
const app = express();

const allowedOrigins = [process.env.CORS_ORIGIN, process.env.CORS_ORIGIN_PROD];
const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};
app.use(cors(corsOptions));
// app.use(
//   cors({
//     origin: process.env.CORS_ORIGIN,
//     credentials: true,
//   }),
// );
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());
//routes import
import scoreRouter from "./routes/score.routes.js";
import activitiesRouter from "./routes/activity.routes.js";
import userRouter from "./routes/user.routes.js";
import { upload } from "./middlewares/multer.middleware.js";

//routes declaration
//Because of this below line multer was used as middleware for all routes.
// app.use("/api/v1/score", upload.single("file"), scoreRouter);
app.use("/api/v1/score", scoreRouter);
app.use("/api/v1/activity", activitiesRouter);
app.use("/api/v1/user", userRouter);

export { app };
