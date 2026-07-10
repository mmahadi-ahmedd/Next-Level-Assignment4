import { prisma } from "../../lib/prisma";
import ApiError from "../../utils/ApiError";

const createBooking = async (
  customerId: number,
  payload: { serviceId: number; scheduledAt: string; address: string; notes?: string }
) => {
  const service = await prisma.service.findUnique({ where: { id: payload.serviceId } });
  if (!service) {
    throw new ApiError(404, 'Service not found.');
  }

  return prisma.booking.create({
    data: {
      customerId,
      technicianId: service.technicianId,
      serviceId: service.id,
      scheduledAt: new Date(payload.scheduledAt),
      address: payload.address,
      notes: payload.notes,
      status: 'REQUESTED',
    },
    include: {
      service: true,
      technician: { include: { user: { select: { id: true, name: true, email: true } } } },
    },
  });
};

const getUserBookings = async (userId: number, role: string) => {
  if (role === 'CUSTOMER') {
    return prisma.booking.findMany({
      where: { customerId: userId },
      include: {
        service: true,
        technician: { include: { user: { select: { id: true, name: true, email: true } } } },
        payment: true,
        review: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  if (role === 'TECHNICIAN') {
    const profile = await prisma.technicianProfile.findUnique({ where: { userId } });
    if (!profile) {
      throw new ApiError(404, 'Technician profile not found.');
    }
    return prisma.booking.findMany({
      where: { technicianId: profile.id },
      include: {
        service: true,
        customer: { select: { id: true, name: true, email: true, phone: true } },
        payment: true,
        review: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ADMIN falls through to admin module instead; guard just in case
  throw new ApiError(403, 'Use the admin endpoint to view all bookings.');
};

const getBookingById = async (userId: number, role: string, bookingId: number) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      service: true,
      customer: { select: { id: true, name: true, email: true, phone: true } },
      technician: { include: { user: { select: { id: true, name: true, email: true } } } },
      payment: true,
      review: true,
    },
  });

  if (!booking) {
    throw new ApiError(404, 'Booking not found.');
  }

  if (role === 'CUSTOMER' && booking.customerId !== userId) {
    throw new ApiError(403, 'This booking does not belong to you.');
  }

  if (role === 'TECHNICIAN') {
    const profile = await prisma.technicianProfile.findUnique({ where: { userId } });
    if (!profile || booking.technicianId !== profile.id) {
      throw new ApiError(403, 'This booking does not belong to you.');
    }
  }

  return booking;
};

const cancelBooking = async (customerId: number, bookingId: number) => {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) {
    throw new ApiError(404, 'Booking not found.');
  }
  if (booking.customerId !== customerId) {
    throw new ApiError(403, 'This booking does not belong to you.');
  }

  const nonCancellableStatuses = ['IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'DECLINED'];
  if (nonCancellableStatuses.includes(booking.status)) {
    throw new ApiError(
      400,
      `Booking cannot be cancelled once it reaches ${booking.status} status.`
    );
  }

  return prisma.booking.update({
    where: { id: bookingId },
    data: { status: 'CANCELLED' },
  });
};

export const BookingService = {
  createBooking,
  getUserBookings,
  getBookingById,
  cancelBooking,
};
