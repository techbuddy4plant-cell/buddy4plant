/**
 * Google Sheet for enquiries.
 * Paste the "Web app URL" of the Google Apps Script here (see GOOGLE-SHEET-SETUP.md).
 * Leave empty to switch it off. A Netlify/.env variable VITE_ENQUIRY_SHEET_URL also works.
 */
const fromEnv = ((import.meta as any).env?.VITE_ENQUIRY_SHEET_URL || '') as string;
export const ENQUIRY_SHEET_URL: string = fromEnv || '';
