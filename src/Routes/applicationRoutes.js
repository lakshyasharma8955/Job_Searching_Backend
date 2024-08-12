import express from "express";
const router = express();
import * as applicationController from "../Controller/applicationController.js"
import {verifyToken} from "../MiddleWare/userMiddleware.js";
import upload from "../Config/multer.js";

router.post("/get-employeeApp",verifyToken,applicationController.employeeGetAllApplication);
router.post("/get-jobseekerApp",verifyToken,applicationController.jobSeekerGetAllApplication);
router.post("/delete-jobseekerApp/:id",verifyToken,applicationController.jobSeekerDeleteApplication);
router.post("/post-application",verifyToken,upload.single("resume"),applicationController.postApplication);

export default router;  
