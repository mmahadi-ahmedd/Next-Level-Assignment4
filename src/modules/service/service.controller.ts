import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { ServiceService } from "./service.service";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "../../utils/httpStatus";

const getAllServices = catchAsync(async (req: Request, res: Response) => {
  const result = await ServiceService.getAllServices(req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Services retrieved successfully',
    data: result,
  });
});

const getServiceById = catchAsync(async (req: Request, res: Response) => {
  const result = await ServiceService.getServiceById(Number(req.params.id));
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Service retrieved successfully',
    data: result,
  });
});

const createService = catchAsync(async (req: Request, res: Response) => {
  const result = await ServiceService.createService(req.user!.id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Service created successfully',
    data: result,
  });
});

const updateService = catchAsync(async (req: Request, res: Response) => {
  const result = await ServiceService.updateService(req.user!.id, Number(req.params.id), req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Service updated successfully',
    data: result,
  });
});

const deleteService = catchAsync(async (req: Request, res: Response) => {
  await ServiceService.deleteService(req.user!.id, Number(req.params.id));
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Service deleted successfully',
    data: null,
  });
});


export const ServiceController = {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
};