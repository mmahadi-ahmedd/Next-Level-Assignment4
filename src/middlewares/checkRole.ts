import { Request, Response, NextFunction } from 'express';
import ApiError from '../utils/ApiError';

const checkRole = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new ApiError(401, 'You are not authorized.'));
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ApiError(403, `Access denied. Requires one of these roles: ${allowedRoles.join(', ')}`)
      );
    }
    next();
  };
};

export default checkRole;