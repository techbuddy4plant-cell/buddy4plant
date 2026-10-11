# WhatsApp + SMS messages – setup

The website now sends:

| When | Who | WhatsApp | SMS |
|---|---|---|---|
| An order is placed (COD, or paid online) | Customer | Order details: number, items, total, payment, address, tracking link | Short confirmation + tracking link |
| An order is placed | Store (ORDER_ALERT_PHONE) | "New order" alert | optional |
| A signed-in customer added to cart / looked at products and did not order | Customer | One reminder after 3 hours | One reminder |

Reminder rules: only between 9 am and 9 pm IST, at most one every 3 days per customer, never after they order, and only if their account has a mobile number. This applies to the profile number or an address number.

Nothing is sent until the keys below are added in **Cloudflare → Workers & Pages → buddy4plant → Settings → Variables and secrets**. WhatsApp and SMS work independently, so either one can go live first.

Check the setup at **https://buddy4plant.in/api/notify/config**. If you add `?test=1`, it also sends a test alert to the store number, at most once every 10 minutes.

---

## 1. WhatsApp (Meta WhatsApp Cloud API – no monthly fee, pay per message)

1. Go to **business.facebook.com** and create or open the Buddy4Plant business portfolio.
2. Go to **developers.facebook.com → My Apps → Create app**. Choose type "Business" and link it to the portfolio. Add the **WhatsApp** product.
3. Under **WhatsApp → API Setup → Add phone number**, use a number that is **not** currently in the WhatsApp app. You can use a new SIM or a landline, or delete WhatsApp from that number first. Verify it with the code.
4. Under **WhatsApp Manager → Payment settings**, add a card.
5. Complete **Business verification** in the business settings. Until then, Meta limits how many people you can message per day.
6. Get a permanent token:
   - Go to **Business settings → Users → System users → Add** (role Admin).
   - Choose **Assign assets**, pick the app, and give it full control.
   - Choose **Generate token**, pick the app, and tick `whatsapp_business_messaging` and `whatsapp_business_management`. Set expiry to **Never**.
7. Create these 3 templates in **WhatsApp Manager → Message templates**. Use language **English**, and keep the names exactly as shown.

**order_confirmation** – category **Utility**
```
Hi {{1}}, thank you for shopping with Buddy4Plant!
Your order {{2}} is confirmed.
Items: {{3}}
Total: {{4}} ({{5}})
Delivery to: {{6}}
We will message you again when it ships.
```
Sample values: Asha · B4P-123456 · Snake Plant x2, Ceramic Pot x1 · Rs 1,299 · Cash on Delivery · 12 MG Road, Lucknow, 226001. Track: https://buddy4plant.in/track-order?id=B4P-123456

**new_order_alert** – category **Utility**
```
New order {{1}} on buddy4plant.in
Customer: {{2}}
Items: {{3}}
Total: {{4}} ({{5}})
City: {{6}}
```

**cart_reminder** – category **Marketing**. Add a Quick-reply button "Stop reminders".
```
Hi {{1}}, still thinking about {{2}}? Your plants are waiting for you at Buddy4Plant.
Pick up where you left off: {{3}}
```

8. Add these in Cloudflare:

| Name | Value | Type |
|---|---|---|
| WHATSAPP_TOKEN | the permanent token | **Secret** |
| WHATSAPP_PHONE_NUMBER_ID | "Phone number ID" from API Setup (not the phone number) | Text |
| ORDER_ALERT_PHONE | store mobile, 10 digits | Text |

If Meta approves a template under a different name or language, set WA_TEMPLATE_ORDER / WA_TEMPLATE_ADMIN / WA_TEMPLATE_REMINDER / WHATSAPP_LANG (for example `en_US`).

## 2. SMS (Fast2SMS, DLT route)

Indian rules (TRAI) require every business SMS to be registered on DLT first.

1. Register as a **Principal Entity** on a DLT portal, for example Jio TrueConnect or Airtel DLT. This needs your PAN/GST and a one-time fee to the operator. Fast2SMS offers help with this.
2. On the DLT portal:
   - Register a 6-letter **Header (sender ID)**, for example `BDYPLT`.
   - Register these **content templates**, category **Service Implicit**:

Order:
```
Dear {#var#}, your Buddy4Plant order {#var#} for {#var#} is confirmed. Track it at buddy4plant.in/track-order - Buddy4Plant
```
Reminder:
```
Hi {#var#}, still thinking about {#var#}? Pick up where you left off at buddy4plant.in - Buddy4Plant
```
Store alert (optional):
```
New Buddy4Plant order {#var#} for {#var#} ({#var#}). Customer mobile {#var#}. - Buddy4Plant
```
3. Sign up at **fast2sms.com** and recharge the wallet.
   - Under **DLT SMS → DLT Manager**, add your entity, header and templates. Each approved template gets a **Message ID**.
   - Under **Dev API**, copy the API key.
4. Add these in Cloudflare:

| Name | Value | Type |
|---|---|---|
| FAST2SMS_API_KEY | API key | **Secret** |
| FAST2SMS_SENDER_ID | your header, e.g. BDYPLT | Text |
| FAST2SMS_ORDER_MSG_ID | Message ID of the order template | Text |
| FAST2SMS_REMINDER_MSG_ID | Message ID of the reminder template | Text |
| FAST2SMS_ADMIN_MSG_ID | (optional) store alert template | Text |

## How it works (for developers)
- `netlify/functions/notify.mjs`:
  - `POST /api/notify/order {id}` reads the order from Firestore and sends the messages once. It marks the order with `notifiedAt` and `notifyResult`.
  - `notifyAll()` runs from the 30-minute cron. It catches missed orders (last 6 h) and sends due reminders.
- `src/services/notifyService.ts`:
  - Signed-in customers' cart and last viewed products go to the Firestore collection `cartActivity/{uid}`.
  - `orderPlaced()` is called from checkout.
- Optional: `REMINDER_AFTER_HOURS` (default 3).
