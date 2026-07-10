import { prisma } from "../../lib/prisma";
import ApiError from "../../utils/ApiError";

const createReview = async (
  customerId: number,
  payload: { bookingId: number; rating: number; comment?: string }
) => {
  const booking = await prisma.booking.findUnique({
    where: { id: payload.bookingId },
    include: { review: true },
  });

  if (!booking) {
    throw new ApiError(404, 'Booking not found.');
  }
  if (booking.customerId !== customerId) {
    throw new ApiError(403, 'This booking does not belong to you.');
  }
  if (booking.status !== 'COMPLETED' ) {
    throw new ApiError(400, 'You can only review a booking after the job is completed.');
  }
  if (booking.review) {
    throw new ApiError(409, 'This booking has already been reviewed.');
  }

  // Create the review and recalculate the technician's average rating
  // atomically so the two never drift out of sync.
  return prisma.$transaction(async (tx) => {
    const review = await tx.review.create({
      data: {
        bookingId: booking.id,
        customerId,
        technicianId: booking.technicianId,
        rating: payload.rating,
        comment: payload.comment,
      },
    });

    const aggregate = await tx.review.aggregate({
      where: { technicianId: booking.technicianId },
      _avg: { rating: true },
    });

    await tx.technicianProfile.update({
      where: { id: booking.technicianId },
      data: { avgRating: aggregate._avg.rating ?? 0 },
    });

    return review;
  });
};

const getReviewsForTechnician = async (technicianId: number) => {
  return prisma.review.findMany({
    where: { technicianId },
    include: { customer: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'desc' },
  });
};

export const ReviewService = {
  createReview,
  getReviewsForTechnician,
};
