/**
 * Google Sheet for enquiries.
 * Paste the "Web app URL" of the Google Apps Script here (see GOOGLE-SHEET-SETUP.md).
 * Leave empty to switch it off. A Netlify/.env variable VITE_ENQUIRY_SHEET_URL also works.
 */
const fromEnv = ((import.meta as any).env?.VITE_ENQUIRY_SHEET_URL || '') as string;
export const ENQUIRY_SHEET_URL: string = fromEnv || '';

/**
 * Firebase App Check (bot protection): the reCAPTCHA v3 *site key* from
 * Firebase console > App Check > Apps > web app > reCAPTCHA. This key is public (safe to keep here).
 * Leave empty to switch App Check off. A VITE_APP_CHECK_SITE_KEY variable also works.
 */
export const APP_CHECK_SITE_KEY: string = ((import.meta as any).env?.VITE_APP_CHECK_SITE_KEY || '') as string;
