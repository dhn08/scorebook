import { Router } from "express";
import {
  deleteAllCalenderDataByMonth,
  getAllCalenderData,
  getAllCalenderDataMonthWise,
  uploadExcelData,
} from "../controllers/activity.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
const router = Router();
router.route("/uploadExcelData").post(upload.single("file"), uploadExcelData);
router
  .route("/deleteAllCalenderDataByMonth")
  .delete(deleteAllCalenderDataByMonth);
router.route("/getAllCalenderData").get(getAllCalenderData);
router.route("/getAllCalenderDataMonthWise").get(getAllCalenderDataMonthWise);
export default router;
