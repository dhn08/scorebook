import { Router } from "express";
import {
  deleteAllBiweeklyData,
  getAllBiweeklyData,
  getLatestBiweeklyData,
  uploadExcelData,
} from "../controllers/score.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
const router = Router();
router.route("/uploadExcelData").post(upload.single("file"), uploadExcelData);
router.route("/deleteAllBiweeklyData").delete(deleteAllBiweeklyData);
router.route("/latestBiweeklyData").get(getLatestBiweeklyData);
router.route("/getAllBiweeklyData").get(getAllBiweeklyData);

export default router;
