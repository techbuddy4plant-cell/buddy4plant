# Automatic WhatsApp confirmation - setup (one time)

When someone sends an enquiry on the Gardening Services page, the website sends them a WhatsApp
message from **+91 80048 81668** saying they have raised a query for that service.
Optionally you also get a WhatsApp alert for every new enquiry.

WhatsApp only allows automatic messages through the **WhatsApp Business Platform (Cloud API)**.
Your number can stay on the WhatsApp Business app at the same time ("coexistence").

## 1. Connect the number
1. Go to business.facebook.com and create / open your Meta Business account.
2. WhatsApp Manager > Add phone number > choose **"Connect your existing WhatsApp Business app"** and
   scan the QR code from the WhatsApp Business app on the phone with +91 80048 81668.
   (Or use a Meta partner such as 360dialog / Interakt / WATI that supports coexistence.)
3. Keep opening the WhatsApp Business app at least once every 2 weeks.

## 2. Create the message templates (WhatsApp Manager > Message templates, category "Utility")
**enquiry_received** (language: English)
> Hi {{1}}, thank you for contacting Buddy4Plant. You have raised a query for {{2}}. Our team will call you shortly. For anything urgent, reply here or call +91 80048 81668.

Optional owner alert, e.g. **new_enquiry_alert**
> New website enquiry: {{1}} ({{2}}) needs {{3}} in {{4}}.

Wait until the templates show "Approved".

## 3. Add the keys to the server (.env)
```
WHATSAPP_TOKEN=<permanent access token from Meta (System User)>
WHATSAPP_PHONE_NUMBER_ID=<Phone number ID from WhatsApp Manager>
WHATSAPP_ENQUIRY_TEMPLATE=enquiry_received
WHATSAPP_TEMPLATE_LANG=en
WHATSAPP_OWNER_NUMBER=918004881668
WHATSAPP_OWNER_TEMPLATE=new_enquiry_alert
```
Restart the server. Until these are filled in, enquiries still save normally and the customer can
tap "Send on WhatsApp" on the thank-you screen; no automatic message is sent.

Note: Meta charges a small fee per business-initiated (template) message in India.
