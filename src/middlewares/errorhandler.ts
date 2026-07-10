import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import ApiError from '../utils/ApiError';
import { Prisma } from '../../generated/prisma/client';

const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500;
  let message = 'Something went wrong!';
  let errorDetails: unknown = err instanceof Error ? err.message : err;

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    errorDetails = err.errorDetails ?? err.message;
  } else if (err instanceof ZodError) {
    statusCode = 400;
    message = 'Validation Error';
    errorDetails = err.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
    }));
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      statusCode = 409;
      message = `Duplicate value for field(s): ${(err.meta?.target as string[])?.join(', ')}`;
      errorDetails = err.meta;
    } else if (err.code === 'P2025') {
      statusCode = 404;
      message = 'Record not found';
      errorDetails = err.meta;
    } else if (err.code === 'P2003') {
      statusCode = 400;
      message = 'Invalid reference - related record does not exist';
      errorDetails = err.meta;
    } else {
      statusCode = 400;
      message = 'Database request error';
      errorDetails = err.meta;
    }
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  res.status(statusCode).json({
    success: false,
    message,
    errorDetails,
  });
};

export default globalErrorHandler;
