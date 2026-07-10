import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { PaymentService } from "./payment.service";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "../../utils/httpStatus";
import Stripe from "stripe";
import { stripe } from "../../lib/stripe";
import ApiError from "../../utils/ApiError";
import config from "../../config";

const createPaymentSession = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentService.createPaymentSession(req.user!.id, req.body.bookingId);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Payment session created successfully',
    data: result,
  });
});

const confirmPayment = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentService.manualConfirmPayment(req.user!.id, req.body.bookingId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Payment confirmed and booking marked as PAID',
    data: result,
  });
});

const handleWebhook = catchAsync(async (req: Request, res: Response) => {
  const signature = req.headers['stripe-signature'] as string;
  const webhookSecret = config.stripe_webhook_secret as string;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
  } catch (err: any) {
    throw new ApiError(400, `Webhook signature verification failed: ${err.message}`);
  }

  switch (event.type) {
    case 'payment_intent.succeeded': {
      const intent = event.data.object as Stripe.PaymentIntent;
      await PaymentService.markPaymentCompleted(intent.id);
      break;
    }
    case 'payment_intent.payment_failed': {
      const intent = event.data.object as Stripe.PaymentIntent;
      await PaymentService.markPaymentFailed(intent.id);
      break;
    }
    default:
      break;
  }

  res.status(200).json({ received: true });
});

const getUserPayments = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentService.getUserPayments(req.user!.userId, req.user!.role);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Payments retrieved successfully',
    data: result,
  });
});

const getPaymentById = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentService.getPaymentById(
    req.user!.userId,
    req.user!.role,
    Number(req.params.id)
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Payment retrieved successfully',
    data: result,
  });
});

export const PaymentController = {
  createPaymentSession,
  confirmPayment,
  handleWebhook,
  getUserPayments,
  getPaymentById,
};
