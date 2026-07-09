import { Request, Response, NextFunction } from 'express';
import ApiError from '../utils/ApiError';
import { JwtPayload } from 'jsonwebtoken';
import { jwtUtils } from '../utils/jwt'
import { prisma } from '../lib/prisma';
import config from '../config';

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
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                throw new ApiError(401, 'You are not authorized. No token provided.');
            }

            const token = authHeader.split(' ')[1];
            const result = jwtUtils.verifyToken(token as string, config.jwt_access_secret)

            if (!result.success || !result.data) {
                throw new ApiError(401, 'Invalid or expired token.');
            }
            const decoded = result.data as JwtPayload;

            //   console.log(decoded)
            const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
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
