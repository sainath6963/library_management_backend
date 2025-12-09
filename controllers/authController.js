import ErrorHandler from "../middlewares/errorMiddlewares.js";
import { User } from "../models/userModel.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import { sendVerificationCode } from "../utils/sendVerificationCode.js";
import { sendToken } from "../utils/sendToken.js";

export const register = catchAsyncErrors(async (req, res, next) => {
  console.log("BODY =>", req.body);
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return next(new ErrorHandler("please enter all fields.", 400));
    }

    const isRegistered = await User.findOne({ email, accountVerified: true });
    if (isRegistered) {
      return next(new ErrorHandler("User already exists", 400));
    }
    const registerationAttemptsByuser = await User.find({
      email,
      accountVerified: false,
    });
    if (registerationAttemptsByuser.length >= 5) {
      return next(
        new ErrorHandler(
          "you have exceeded the number of registration attemps. please contact support",
          400
        )
      );
    }
    if (password.length < 8 || password.length > 16) {
      return next(
        new ErrorHandler("password must be between 8 to 16 characters", 400)
      );
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });
    const verificationCode = await user.generateVerificationCode();
    await user.save();
    sendVerificationCode(verificationCode, email, res);
  } catch (error) {
    next(error);
  }
});



export const verifyOTP = catchAsyncErrors(async (req, res, next) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return next(new ErrorHandler("Email or OTP missing", 400));
  }
console.log("EMAIL FROM BODY =>", email);
console.log("OTP FROM BODY =>", otp);
  const userAllentries = await User.find({ email, accountVerified: false }).sort({ createdAt: -1 });

  if (userAllentries.length === 0) {
    return next(new ErrorHandler("User not found", 404));
  }

  let user;
  if (userAllentries.length > 1) {
    user = userAllentries[0];
    await User.deleteMany({
      _id: { $ne: user._id },
      email,
      accountVerified: false,
    });
  } else {
    user = userAllentries[0];
  }

  if (user.verificationCode !== Number(otp)) {
    return next(new ErrorHandler("Invalid OTP", 400));
  }

  const currentTime = Date.now();
  const verificationCodeExpire = new Date(user.verificationCodeExpire).getTime();

  if (currentTime > verificationCodeExpire) {
    return next(new ErrorHandler("OTP expired", 400));
  }

  user.accountVerified = true;
  user.verificationCode = null;
  user.verificationCodeExpire = null;
  await user.save({ validateModifiedOnly: true });

  sendToken(user, 200, "Account Verified", res);
});
