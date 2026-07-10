import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { ReviewService } from "./review.service";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "../../utils/httpStatus";

const createReview = catchAsync(async (req: Request, res: Response) => {
  const result = await ReviewService.createReview(req.user!.id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Review submitted successfully',
    data: result,
  });
});
export const ReviewController = {
  createReview,
};
