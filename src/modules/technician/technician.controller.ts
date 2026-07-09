import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { TechnicianService } from "./technician.service";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "../../utils/httpStatus";

const getAllTechnicians = catchAsync(async (req: Request, res: Response) => {
  const result = await TechnicianService.getAllTechnicians(req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Technicians retrieved successfully',
    data: result,
  });
});

const getTechnicianById = catchAsync(async (req: Request, res: Response) => {
  const result = await TechnicianService.getTechnicianById(Number(req.params.id));
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Technician profile retrieved successfully',
    data: result,
  });
});

const updateProfile = catchAsync(async (req: Request, res: Response) => {
  const result = await TechnicianService.updateProfile(req.user!.id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Profile updated successfully',
    data: result,
  });
});

const updateAvailability = catchAsync(async (req: Request, res: Response) => {
  const result = await TechnicianService.updateAvailability(req.user!.id, req.body.slots);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Availability updated successfully',
    data: result,
  });
});

const getTechnicianBookings = catchAsync(async (req: Request, res: Response) => {
  const result = await TechnicianService.getTechnicianBookings(req.user!.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Bookings retrieved successfully',
    data: result,
  });
});

const updateBookingStatus = catchAsync(async (req: Request, res: Response) => {
  const result = await TechnicianService.updateBookingStatus(
    req.user!.userId,
    Number(req.params.id),
    req.body.status
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Booking status updated successfully',
    data: result,
  });
});

export const TechnicianController = {
  getAllTechnicians,
  getTechnicianById,
  updateProfile,
  updateAvailability,
  getTechnicianBookings,
  updateBookingStatus,
};