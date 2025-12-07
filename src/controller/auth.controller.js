import { db } from "../config/firebase.js";
import { sendOTP } from "../utils/mailer.js";
import admin from "firebase-admin";

const generateOtp = () => Math.floor(1000 + Math.random() * 9000).toString();

export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email are required",
      });
    }
    const userQuery = await db
      .collection("users")
      .where("email", "==", email)
      .get();

    if (userQuery.empty) {
      return res.status(404).json({
        success: false,
        message: "Email doesn't exist",
      });
    }
    const otp = generateOtp();
    // Save OTP temporarily in Firestore → OTP collection
    await db.collection("otp").doc(email).set({
      otp,
      createdAt: new Date(),
    });
    // Send OTP via email
    await sendOTP(email, otp);

    res.json({
      message: "OTP sent successfully",
      otpCode: otp,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

// 🔹 VERIFY OTP
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const doc = await db.collection("otp").doc(email).get();

    if (!doc.exists) return res.status(400).json({ message: "OTP not found" });

    if (doc.data().otp !== otp)
      return res.status(400).json({ message: "Incorrect OTP" });

    res.json({ message: "OTP verified successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error verifying OTP", error: err.message });
  }
};

// 🔹 RESET PASSWORD
export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword)
      return res.status(400).json({ message: "Email & new password required" });

    // 1️⃣ Find user UID from Firebase Authentication
    const userRecord = await admin.auth().getUserByEmail(email);

    // 2️⃣ Update password in FirebaseAuth
    await admin.auth().updateUser(userRecord.uid, {
      password: newPassword,
    });

    return res.json({
      success: true,
      message: "Password updated successfully!",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to reset password",
      error: error.message,
    });
  }
};
