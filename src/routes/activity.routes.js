import { Router } from "express";
import {
  deleteAllCalenderDataByMonth,
  getAllCalenderData,
  uploadExcelData,
} from "../controllers/activity.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
const router = Router();
router.route("/uploadExcelData").post(upload.single("file"), uploadExcelData);
router
  .route("/deleteAllCalenderDataByMonth")
  .delete(deleteAllCalenderDataByMonth);
router.route("/getAllCalenderData").get(getAllCalenderData);
export default router;
