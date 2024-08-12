import express from "express";
const router = express();
import * as jobController from "../Controller/jobController.js";
import {verifyToken} from "../MiddleWare/userMiddleware.js";

router.post("/getAll-jobs",jobController.getAllJobs);
router.post("/post-jobs",verifyToken,jobController.postjobs);
router.post("/get-myJobs",verifyToken,jobController.getMyJobs);
router.post("/update-jobs/:id",verifyToken,jobController.updateJob);
router.post("/delete-jobs/:id",verifyToken,jobController.deleteJobs);
router.post("/getSingle-job/:id",verifyToken,jobController.getSingleJob);
router.post("/generate-excel",verifyToken,jobController.generateExcelFile);

export default router;

