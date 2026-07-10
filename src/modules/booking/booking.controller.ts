import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { BookingService } from "./booking.service";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "../../utils/httpStatus";

const createBooking = catchAsync(async (req: Request, res: Response) => {
  const result = await BookingService.createBooking(req.user!.id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Booking created successfully',
    data: result,
  });
});

const getUserBookings = catchAsync(async (req: Request, res: Response) => {
  const result = await BookingService.getUserBookings(req.user!.id, req.user!.role);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Bookings retrieved successfully',
    data: result,
  });
});

const getBookingById = catchAsync(async (req: Request, res: Response) => {
  const result = await BookingService.getBookingById(
    req.user!.id,
    req.user!.role,
    Number(req.params.id)
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Booking retrieved successfully',
    data: result,
  });
});

const cancelBooking = catchAsync(async (req: Request, res: Response) => {
  const result = await BookingService.cancelBooking(req.user!.id, Number(req.params.id));
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Booking cancelled successfully',
    data: result,
  });
});


export const BookingController = {
  createBooking,
  getUserBookings,
  getBookingById,
  cancelBooking,
};
