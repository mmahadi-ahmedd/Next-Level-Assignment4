import { prisma } from "../../lib/prisma";
import ApiError from "../../utils/ApiError";

interface ServiceFilters {
  categoryId?: string;
  location?: string;
  minPrice?: string;
  maxPrice?: string;
  search?: string;
}

const getAllServices = async (filters: ServiceFilters) => {
  const { categoryId, location, minPrice, maxPrice, search } = filters;

  const where: any = {};
  if (categoryId) where.categoryId = Number(categoryId);
  if (minPrice || maxPrice) {
    where.price = {
      ...(minPrice ? { gte: Number(minPrice) } : {}),
      ...(maxPrice ? { lte: Number(maxPrice) } : {}),
    };
  }
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }
  if (location) {
    where.technician = { location: { contains: location, mode: 'insensitive' } };
  }

  return prisma.service.findMany({
    where,
    include: {
      category: true,
      technician: {
        include: { user: { select: { id: true, name: true, email: true } } },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

const getServiceById = async (id: number) => {
  const service = await prisma.service.findUnique({
    where: { id },
    include: {
      category: true,
      technician: { include: { user: { select: { id: true, name: true, email: true } } } },
    },
  });
  if (!service) {
    throw new ApiError(404, 'Service not found.');
  }
  return service;
};


const createService = async (
  userId: number,
  payload: { categoryId: number; title: string; description: string; price: number }
) => {
  const profile = await prisma.technicianProfile.findUnique({ where: { userId } });
  if (!profile) {
    throw new ApiError(404, 'Technician profile not found. Please complete your profile first.');
  }

  const category = await prisma.category.findUnique({ where: { id: payload.categoryId } });
  if (!category) {
    throw new ApiError(404, 'Category not found.');
  }

  return prisma.service.create({
    data: {
      technicianId: profile.id,
      categoryId: payload.categoryId,
      title: payload.title,
      description: payload.description,
      price: payload.price,
    },
  });
};

const updateService = async (
  userId: number,
  serviceId: number,
  payload: Partial<{ categoryId: number; title: string; description: string; price: number }>
) => {
  const profile = await prisma.technicianProfile.findUnique({ where: { userId } });
  if (!profile) {
    throw new ApiError(404, 'Technician profile not found.');
  }

  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service) {
    throw new ApiError(404, 'Service not found.');
  }
  if (service.technicianId !== profile.id) {
    throw new ApiError(403, 'This service does not belong to you.');
  }

  return prisma.service.update({ where: { id: serviceId }, data: payload });
};

const deleteService = async (userId: number, serviceId: number) => {
  const profile = await prisma.technicianProfile.findUnique({ where: { userId } });
  if (!profile) {
    throw new ApiError(404, 'Technician profile not found.');
  }

  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service) {
    throw new ApiError(404, 'Service not found.');
  }
  if (service.technicianId !== profile.id) {
    throw new ApiError(403, 'This service does not belong to you.');
  }

  await prisma.service.delete({ where: { id: serviceId } });
  return null;
};

export const ServiceService = {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
};
