import { Request, Response, NextFunction } from 'express';
import { jwtUtils } from '../utils/jwt'; // wherever your jwtUtils file actually lives
import config from '../config';
import ApiError from '../utils/ApiError';
import { JwtPayload } from 'jsonwebtoken';
import { prisma } from '../lib/prisma';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

const auth = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.cookies?.accessToken
        ? req.cookies.accessToken
        : req.headers.authorization?.startsWith('Bearer ')
        ? req.headers.authorization.split(' ')[1]
        : req.headers.authorization;

      if (!token) {
        throw new ApiError(401, 'You are not authorized. No token provided.');
      }

      const result = jwtUtils.verifyToken(token, config.jwt_access_secret);
      if (!result.success) {
        throw new ApiError(401, 'Invalid or expired token.');
      }

      const decoded = result.data as JwtPayload;

      const user = await prisma.user.findUnique({ where: { id: decoded.id } });
      if (!user) {
        throw new ApiError(401, 'User no longer exists.');
      }
      if (user.status === 'BANNED') {
        throw new ApiError(403, 'Your account has been banned. Contact support.');
      }

      req.user = decoded;
      next();
    } catch (error) {
      next(error);
    }
  };
};

export default auth;

// import { NextFunction, Request, Response } from "express";
// import { JwtPayload } from "jsonwebtoken";
// import { Role, UserStatus } from "../../generated/prisma/enums";
// import config from "../config";
// import { prisma } from "../lib/prisma";
// import { jwtUtils } from "../utils/jwt";
// import catchAsync from "../utils/catchAsync";

// declare global {
//     namespace Express {
//         interface Request {
//             user?: {
//                 email: string;
//                 name: string;
//                 role: Role;
//             }
//         }
//     }
// }

// // auth(Role.ADMIN, Role.USER, Role.Author)
// // auth() => ...requiredRoles => [Role.ADMIN, Role.USER, Role.AUTHOR]
// const auth = (...requiredRoles : Role[]) => {
//     return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
//         const token = req.cookies.accessToken ?
//             req.cookies.accessToken 
//             :
//             req.headers.authorization?.startsWith("Bearer ") ? 
//             req.headers.authorization?.split(" ")[1] 
//             : req.headers.authorization;

//         if(!token){
//             throw new Error("You are not logged in. Please log in to access this resource.");
//         }

//         const verifiedToken = jwtUtils.verifyToken(token, config.jwt_access_secret);

//         if (!verifiedToken.success) {
//             throw new Error(verifiedToken.error);
//         }

//         const { email, name, role } = verifiedToken.data as JwtPayload;

//         if(requiredRoles.length && !requiredRoles.includes(role)){
//             throw new Error("Forbidden. You don't have permission to access this resource.");
//         }

//         const user = await prisma.user.findUnique({
//             where: {
//                 email,
//                 name,
//                 role
//             }
//         });

//         if(!user){
//             throw new Error("User not found. Please log in again.");
//         }

//         if(user.status === "BANNED"){
//             throw new Error("Your account has been blocked. Please contact support.");
//         }

//         req.user = {
//             email,
//             name,
//             role
//         }

//         next();
        
//     }
// )
// }

// export default auth;