// Vercel entry point - reuses the same Shiprocket code as the Netlify function
import handler from '../../netlify/functions/shiprocket.mjs';
export const GET = (request) => handler(request);
export const POST = (request) => handler(request);
