import { Response } from 'express';

interface ApiResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data?: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

const sendResponse = <T>(res: Response, response: ApiResponse<T>) => {
  return res.status(response.statusCode).json({
    success: response.success,
    message: response.message,
    meta: response.meta,
    data: response.data,
  });
};

export default sendResponse;