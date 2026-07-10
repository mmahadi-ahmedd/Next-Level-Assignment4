import { prisma } from "../../lib/prisma";
import ApiError from "../../utils/ApiError";

const getAllUsers = async () => {
  return prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      status: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });
};


const updateUserStatus = async (userId: number, status: 'ACTIVE' | 'BANNED') => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new ApiError(404, 'User not found.');
  }
  if (user.role === 'ADMIN') {
    throw new ApiError(400, 'Cannot change the status of an admin account.');
  }

  return prisma.user.update({
    where: { id: userId },
    data: { status },
    select: { id: true, name: true, email: true, role: true, status: true },
  });
};

const getAllBookings = async () => {
  return prisma.booking.findMany({
    include: {
      customer: { select: { id: true, name: true, email: true } },
      technician: { include: { user: { select: { id: true, name: true, email: true } } } },
      service: true,
      payment: true,
    },
    orderBy: { createdAt: 'desc' },
  });
};


export const AdminService = {
  getAllUsers,
  updateUserStatus,
  getAllBookings,
};
