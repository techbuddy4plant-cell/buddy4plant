/**
 * Pincode -> city (district) and state.
 * Uses India Post's public lookup, with an offline fallback that at least fills the state
 * from the pincode's first digits.
 */
export type PincodePlace = { city: string; state: string };

const cache = new Map<string, PincodePlace | null>();

const PREFIX_STATE: [RegExp, string][] = [
  [/^11/, 'Delhi'],
  [/^160/, 'Chandigarh'],
  [/^1[23]/, 'Haryana'],
  [/^1[456]/, 'Punjab'],
  [/^17/, 'Himachal Pradesh'],
  [/^194/, 'Ladakh'],
  [/^1[89]/, 'Jammu and Kashmir'],
  [/^(24[6-9]|26[23])/, 'Uttarakhand'],
  [/^2[0-8]/, 'Uttar Pradesh'],
  [/^3[0-4]/, 'Rajasthan'],
  [/^396/, 'Dadra and Nagar Haveli and Daman and Diu'],
  [/^3[6-9]/, 'Gujarat'],
  [/^403/, 'Goa'],
  [/^4[0-4]/, 'Maharashtra'],
  [/^49/, 'Chhattisgarh'],
  [/^4[5-8]/, 'Madhya Pradesh'],
  [/^50/, 'Telangana'],
  [/^5[1-3]/, 'Andhra Pradesh'],
  [/^5[6-9]/, 'Karnataka'],
  [/^605/, 'Puducherry'],
  [/^6[0-4]/, 'Tamil Nadu'],
  [/^6[7-9]/, 'Kerala'],
  [/^737/, 'Sikkim'],
  [/^7[0-4]/, 'West Bengal'],
  [/^7[5-7]/, 'Odisha'],
  [/^79[0-2]/, 'Arunachal Pradesh'],
  [/^79[34]/, 'Meghalaya'],
  [/^795/, 'Manipur'],
  [/^796/, 'Mizoram'],
  [/^79[78]/, 'Nagaland'],
  [/^799/, 'Tripura'],
  [/^78/, 'Assam'],
  [/^(81[4-6]|82[5-9]|83[0-5])/, 'Jharkhand'],
  [/^8[0-5]/, 'Bihar'],
];

export const stateFromPincode = (pin: string) => PREFIX_STATE.find(([re]) => re.test(pin))?.[1] || '';

export async function lookupPincode(pin: string): Promise<PincodePlace | null> {
  const p = (pin || '').replace(/\D/g, '');
  if (!/^[1-9]\d{5}$/.test(p)) return null;
  if (cache.has(p)) return cache.get(p)!;
  let place: PincodePlace | null = null;
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 5000);
    const res = await fetch(`https://api.postalpincode.in/pincode/${p}`, { signal: ctrl.signal });
    clearTimeout(t);
    const data = await res.json();
    const po = data?.[0]?.Status === 'Success' ? data[0].PostOffice?.[0] : null;
    if (po) place = { city: po.District || po.Block || po.Name || '', state: po.State || '' };
  } catch {
    // offline or blocked - use the fallback below
  }
  if (!place) {
    const state = stateFromPincode(p);
    place = state ? { city: '', state } : null;
  }
  cache.set(p, place);
  return place;
}
