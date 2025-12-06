import express from "express";
import { sendOtp, verifyOTP,resetPassword } from "../controller/auth.controller.js";

const router = express.Router();

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOTP);
router.post("/reset-password", resetPassword);

export default router;
