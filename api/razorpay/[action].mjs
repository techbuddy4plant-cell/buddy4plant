// Vercel entry point - reuses the same Razorpay code as the Netlify function
import handler from '../../netlify/functions/razorpay.mjs';
export const GET = (request) => handler(request);
export const POST = (request) => handler(request);
