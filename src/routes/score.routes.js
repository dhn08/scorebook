import { Router } from "express";
import {
  deleteAllBiweeklyData,
  getLatestBiweeklyData,
  uploadExcelData,
} from "../controllers/score.controller.js";
const router = Router();
router.route("/uploadExcelData").post(uploadExcelData);
router.route("/deleteAllBiweeklyData").delete(deleteAllBiweeklyData);
router.route("/latestBiweeklyData").get(getLatestBiweeklyData);

export default router;
