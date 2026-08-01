import Stripe from "stripe";
import { prisma } from "../../lib/prisma";
import { stripe } from "../../lib/stripe";
import ApiError from "../../utils/ApiError";

const createPaymentSession = async (customerId: number, bookingId: number) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { service: true, payment: true },
  });

  if (!booking) {
    throw new ApiError(404, 'Booking not found.');
  }
  if (booking.customerId !== customerId) {
    throw new ApiError(403, 'This booking does not belong to you.');
  }
  if (booking.status !== 'ACCEPTED') {
    throw new ApiError(
      400,
      `Payment can only be made for bookings with ACCEPTED status. Current status: ${booking.status}`
    );
  }

  const amountInCents = Math.round(Number(booking.service.price) * 100);

  // Reuse existing pending payment intent if one already exists for this booking
  if (booking.payment && booking.payment.status === 'PENDING') {
    const existingIntent = await stripe.paymentIntents.retrieve(booking.payment.transactionId);
    return {
      clientSecret: existingIntent.client_secret,
      paymentIntentId: existingIntent.id,
      amount: booking.service.price,
    };
  }

  const paymentIntent: Stripe.PaymentIntent = await stripe.paymentIntents.create({
    amount: amountInCents,
    currency: 'usd',
    metadata: { bookingId: String(booking.id), customerId: String(customerId) },
    automatic_payment_methods: { enabled: true },
  });

  await prisma.payment.upsert({
    where: { bookingId: booking.id },
    update: {
      transactionId: paymentIntent.id,
      amount: booking.service.price,
      status: 'PENDING',
      method: 'card',
      provider: 'STRIPE',
    },
    create: {
      bookingId: booking.id,
      customerId,
      transactionId: paymentIntent.id,
      amount: booking.service.price,
      method: 'card',
      provider: 'STRIPE',
      status: 'PENDING',
    },
  });

  return {
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
    amount: booking.service.price,
  };
};

const createCheckoutSession = async (customerId: number, bookingId: number) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { service: true, payment: true },
  });

  if (!booking) throw new ApiError(404, 'Booking not found.');
  if (booking.customerId !== customerId) throw new ApiError(403, 'This booking does not belong to you.');
  if (booking.status !== 'ACCEPTED') {
    throw new ApiError(400, `Booking must be ACCEPTED before payment. Current status: ${booking.status}`);
  }

  const amountInCents = Math.round(Number(booking.service.price) * 100);

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: booking.service.title,
            description: `Booking #${booking.id}`,
          },
          unit_amount: amountInCents,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${process.env.FRONTEND_URL}/payment/success?bookingId=${booking.id}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.FRONTEND_URL}/payment/cancel?bookingId=${booking.id}`,
    metadata: {
      bookingId: String(booking.id),
      customerId: String(customerId),
    },
  });

  // Save pending payment record
  await prisma.payment.upsert({
    where: { bookingId: booking.id },
    update: {
      transactionId: session.id,
      amount: booking.service.price,
      status: 'PENDING',
      method: 'card',
      provider: 'STRIPE',
    },
    create: {
      bookingId: booking.id,
      customerId,
      transactionId: session.id,
      amount: booking.service.price,
      method: 'card',
      provider: 'STRIPE',
      status: 'PENDING',
    },
  });

  return { url: session.url, sessionId: session.id };
};

const verifyCheckoutSession = async (sessionId: string, bookingId: number) => {
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (session.payment_status !== 'paid') {
    throw new ApiError(400, 'Payment not completed.');
  }

  return prisma.$transaction(async (tx) => {
    const payment = await tx.payment.update({
      where: { bookingId },
      data: { status: 'COMPLETED', paidAt: new Date() },
    });
    await tx.booking.update({
      where: { id: bookingId },
      data: { status: 'PAID' },
    });
    return payment;
  });
};

const markPaymentCompleted = async (paymentIntentId: string) => {
  const payment = await prisma.payment.findUnique({ where: { transactionId: paymentIntentId } });
  if (!payment) {
    // Nothing to do - could be an event for a payment intent not created by this flow
    return null;
  }

  return prisma.$transaction(async (tx) => {
    const updatedPayment = await tx.payment.update({
      where: { id: payment.id },
      data: { status: 'COMPLETED', paidAt: new Date() },
    });

    await tx.booking.update({
      where: { id: payment.bookingId },
      data: { status: 'PAID' },
    });

    return updatedPayment;
  });
};

const markPaymentFailed = async (paymentIntentId: string) => {
  const payment = await prisma.payment.findUnique({ where: { transactionId: paymentIntentId } });
  if (!payment) return null;

  return prisma.payment.update({
    where: { id: payment.id },
    data: { status: 'FAILED' },
  });
};

const manualConfirmPayment = async (customerId: number, bookingId: number) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { payment: true },
  });

  if (!booking) {
    throw new ApiError(404, 'Booking not found.');
  }
  if (booking.customerId !== customerId) {
    throw new ApiError(403, 'This booking does not belong to you.');
  }
  if (!booking.payment) {
    throw new ApiError(400, 'No payment session found for this booking. Create one first.');
  }

  const intent = await stripe.paymentIntents.retrieve(booking.payment.transactionId);

  if (intent.status !== 'succeeded') {
    throw new ApiError(
      400,
      `Payment has not succeeded on Stripe yet. Current status: ${intent.status}`
    );
  }

  return markPaymentCompleted(intent.id);
};

const testConfirmPayment = async (customerId: number, bookingId: number) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { payment: true, service: true },
  });

  if (!booking) throw new ApiError(404, 'Booking not found.');
  if (booking.customerId !== customerId) throw new ApiError(403, 'This booking does not belong to you.');
  if (!booking.payment) throw new ApiError(400, 'No payment session found. Create one first.');
  if (booking.payment.status === 'COMPLETED') throw new ApiError(400, 'Payment already completed.');

  // Confirm with Stripe using test card — works in test mode only
  const intent = await stripe.paymentIntents.confirm(
    booking.payment.transactionId,
    {
      payment_method: 'pm_card_visa',
      return_url: 'https://fixitnow-backend-eosin.vercel.app',
    }
  );

  if (intent.status !== 'succeeded') {
    throw new ApiError(400, `Payment failed. Stripe status: ${intent.status}`);
  }

  // Atomically update payment + booking
  return prisma.$transaction(async (tx) => {
    const updatedPayment = await tx.payment.update({
      where: { id: booking.payment!.id },
      data: { status: 'COMPLETED', paidAt: new Date() },
    });
    await tx.booking.update({
      where: { id: bookingId },
      data: { status: 'PAID' },
    });
    return updatedPayment;
  });
};

const getUserPayments = async (userId: number, role: string) => {
  if (role === 'ADMIN') {
    return prisma.payment.findMany({
      include: { booking: true, customer: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }
  return prisma.payment.findMany({
    where: { customerId: userId },
    include: { booking: { include: { service: true } } },
    orderBy: { createdAt: 'desc' },
  });
};

const getPaymentById = async (userId: number, role: string, paymentId: number) => {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { booking: { include: { service: true } } },
  });
  if (!payment) {
    throw new ApiError(404, 'Payment not found.');
  }
  if (role !== 'ADMIN' && payment.customerId !== userId) {
    throw new ApiError(403, 'This payment does not belong to you.');
  }
  return payment;
};



export const PaymentService = {
  createPaymentSession,
  createCheckoutSession,
  verifyCheckoutSession,
  markPaymentCompleted,
  markPaymentFailed,
  manualConfirmPayment,
  testConfirmPayment,
  getUserPayments,
  getPaymentById,
};
