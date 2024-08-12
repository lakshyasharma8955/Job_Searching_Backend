import express from "express";
const router = express.Router();
import * as userController from "../Controller/userController.js";
import {verifyToken} from "../MiddleWare/userMiddleware.js"

router.post("/create-user",userController.register);
router.post("/login-user",userController.login);
router.post("/otp-Varification",verifyToken,userController.otpVerification);
router.post("/resend-otp",verifyToken,userController.resendOtp);
router.post("/logout-user",verifyToken,userController.logout);
router.post("/get-user",verifyToken,userController.getUser);
router.post("/forgot-password",userController.forgotPassword);
router.post("/reset-password",userController.resetPassword);

export default router;