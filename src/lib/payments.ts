import { createServerFn } from "@tanstack/react-start";
import Razorpay from "razorpay";
import crypto from "crypto";

const getRazorpayInstance = () => {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  
  if (!key_id || !key_secret) {
    throw new Error("Razorpay API keys are missing in environment variables.");
  }
  
  return new Razorpay({
    key_id,
    key_secret,
  });
};

export const createRazorpayOrderFn = createServerFn({ method: "POST" })
  .validator((data: { amount: number; receipt: string }) => data)
  .handler(async ({ data }) => {
    const razorpay = getRazorpayInstance();
    
    const options = {
      amount: Math.round(data.amount * 100), // amount in smallest currency unit (paise)
      currency: "INR",
      receipt: data.receipt,
    };
    
    try {
      const order = await razorpay.orders.create(options);
      return { success: true, orderId: order.id, amount: order.amount, currency: order.currency };
    } catch (error: any) {
      console.error("Razorpay order creation failed:", error);
      throw new Error(error.message || "Failed to create Razorpay order");
    }
  });

export const verifyRazorpayPaymentFn = createServerFn({ method: "POST" })
  .validator((data: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => data)
  .handler(async ({ data }) => {
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    
    if (!key_secret) {
      throw new Error("Razorpay secret key is missing");
    }
    
    const body = data.razorpay_order_id + "|" + data.razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", key_secret)
      .update(body.toString())
      .digest("hex");
      
    const isValid = expectedSignature === data.razorpay_signature;
    
    if (!isValid) {
      throw new Error("Invalid payment signature");
    }
    
    return { success: true };
  });
