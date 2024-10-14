import { Router } from "express";

import { upload } from "../middlewares/multer.middleware.js";
import { deleteAllImage, uploadUserImage } from "../controllers/user.routes.js";
const router = Router();
router
  .route("/uploadUserImageData")
  .post(upload.single("file"), uploadUserImage);
router.route("/deleteAllImage").delete(deleteAllImage);

export default router;
