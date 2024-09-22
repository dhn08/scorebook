import { Router } from "express";
import {
  deleteAllBiweeklyData,
  uploadExcelData,
} from "../controllers/score.controller.js";
const router = Router();
router.route("/uploadExcelData").post(uploadExcelData);
router.route("/deleteAllBiweeklyData").delete(deleteAllBiweeklyData);

export default router;
