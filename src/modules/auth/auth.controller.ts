import { NextFunction, Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { AuthService } from "./auth.service";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "../../utils/httpStatus";
import { jwtUtils } from "../../utils/jwt";
import config from "../../config";
import { JwtPayload } from "jsonwebtoken";

const register = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.register(req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'User registered successfully',
    data: result,
  });
});

const login = catchAsync(async (req: Request, res: Response) => {
  const { accessToken, refreshToken } = await AuthService.login(req.body);

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: false,
    sameSite: "none",
    maxAge: 1000 * 60 * 60 * 24 // 24 hour or 1 day
  })

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: false,
    sameSite: "none",
    maxAge: 1000 * 60 * 60 * 24 * 7 // 7 day
  })

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Login successful',
    data: { accessToken, refreshToken },
  });
});


const getMe = catchAsync(async (req: Request, res: Response,next: NextFunction) => {

  const { accessToken } = req.cookies;
  // console.log(req.user, "user request");

  const verifiedToken = jwtUtils.verifyToken(accessToken, config.jwt_access_secret)

  if (typeof verifiedToken === "string") {
    throw new Error(verifiedToken);
  }
   const decoded = verifiedToken.data as JwtPayload;

  const profile = await AuthService.getMe(decoded.id);


  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User profile fetched successfully",
    data: { profile }
  })

})

export const AuthController = {
  register,
  login,
  getMe
};
