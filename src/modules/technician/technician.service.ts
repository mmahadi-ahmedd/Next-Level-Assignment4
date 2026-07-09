import { prisma } from "../../lib/prisma";
import ApiError from "../../utils/ApiError";

interface TechnicianFilters {
    location?: string;
    minRating?: string;
    categoryId?: string;
    search?: string;
}

const getAllTechnicians = async (filters: TechnicianFilters) => {
  const { location, minRating, categoryId, search } = filters;

  const where: any = {};

  if (location) {
    where.location = { contains: location, mode: 'insensitive' };
  }
  if (minRating) {
    where.avgRating = { gte: Number(minRating) };
  }
  if (categoryId || search) {
    where.services = {
      some: {
        ...(categoryId ? { categoryId: Number(categoryId) } : {}),
        ...(search
          ? {
              OR: [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
    };
  }

  return prisma.technicianProfile.findMany({
    where,
    include: {
      user: { select: { id: true, name: true, email: true, phone: true } },
      services: { include: { category: true } },
    },
    orderBy: { avgRating: 'desc' },
  });
};

const getTechnicianById = async (id: number) => {
  const technician = await prisma.technicianProfile.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true } },
      services: { include: { category: true } },
      reviews: {
        include: { customer: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
      },
      availability: true,
    },
  });

  if (!technician) {
    throw new ApiError(404, 'Technician not found.');
  }

  return technician;
};

const updateProfile = async (
  userId: number,
  payload: { bio?: string; experienceYears?: number; hourlyRate?: number; location?: string }
) => {
  const profile = await prisma.technicianProfile.findUnique({ where: { userId } });
  if (!profile) {
    throw new ApiError(404, 'Technician profile not found.');
  }

  return prisma.technicianProfile.update({
    where: { userId },
    data: payload,
  });
};

const updateAvailability = async (
  userId: number,
  slots: { dayOfWeek: number; startTime: string; endTime: string }[]
) => {
  const profile = await prisma.technicianProfile.findUnique({ where: { userId } });
  if (!profile) {
    throw new ApiError(404, 'Technician profile not found.');
  }

  // Replace all slots
  await prisma.availability.deleteMany({ where: { technicianId: profile.id } });
  await prisma.availability.createMany({
    data: slots.map((slot) => ({ ...slot, technicianId: profile.id })),
  });

  return prisma.availability.findMany({ where: { technicianId: profile.id } });
};

const getTechnicianBookings = async (userId: number) => {
  const profile = await prisma.technicianProfile.findUnique({ where: { userId } });
  if (!profile) {
    throw new ApiError(404, 'Technician profile not found.');
  }

  return prisma.booking.findMany({
    where: { technicianId: profile.id },
    include: {
      customer: { select: { id: true, name: true, email: true, phone: true } },
      service: true,
      payment: true,
    },
    orderBy: { createdAt: 'desc' },
  });
};

const updateBookingStatus = async (
  userId: number,
  bookingId: number,
  status: 'ACCEPTED' | 'DECLINED' | 'IN_PROGRESS' | 'COMPLETED'
) => {
  const profile = await prisma.technicianProfile.findUnique({ where: { userId } });
  if (!profile) {
    throw new ApiError(404, 'Technician profile not found.');
  }

  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) {
    throw new ApiError(404, 'Booking not found.');
  }
  if (booking.technicianId !== profile.id) {
    throw new ApiError(403, 'This booking does not belong to you.');
  }

  // Enforce valid status transitions
  const validTransitions: Record<string, string[]> = {
    REQUESTED: ['ACCEPTED', 'DECLINED'],
    PAID: ['IN_PROGRESS'],
    IN_PROGRESS: ['COMPLETED'],
  };

  const allowedNext = validTransitions[booking.status] || [];
  if (!allowedNext.includes(status)) {
    throw new ApiError(
      400,
      `Cannot change status from ${booking.status} to ${status}.`
    );
  }

  return prisma.booking.update({
    where: { id: bookingId },
    data: { status },
  });
};


export const TechnicianService = {
  getAllTechnicians,
  getTechnicianById,
  updateProfile,
  updateAvailability,
  getTechnicianBookings,
  updateBookingStatus,
};