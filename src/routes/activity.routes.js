import { Router } from "express";
import { uploadExcelData } from "../controllers/activity.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
const router = Router();
router.route("/uploadExcelData").post(upload.single("file"), uploadExcelData);

export default router;
