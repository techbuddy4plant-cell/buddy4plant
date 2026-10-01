# Save website enquiries to a Google Sheet

Every enquiry from the Gardening Services form is already saved in the Admin panel
(Admin > Gardening Services > Enquiries). These steps ALSO add each one as a new row in a Google Sheet.

## 1. Create the sheet
1. Open https://sheets.new (signed in as buddy4plant@gmail.com).
2. Name it "Buddy4Plant Enquiries".

## 2. Add the script
1. In the sheet: Extensions > Apps Script.
2. Delete whatever is there and paste this:

```javascript
const HEADERS = ['Date', 'Name', 'Phone', 'Email', 'Organisation', 'Need', 'Property type', 'City', 'Area', 'Message', 'ID'];
const KEYS = ['date', 'name', 'phone', 'email', 'organisation', 'need', 'propertyType', 'city', 'area', 'message', 'id'];

function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  const d = JSON.parse(e.postData.contents);
  // text starting with = + - @ is stored as plain text, never as a formula
  const safe = (v) => { v = String(v == null ? '' : v); return /^[=+\-@]/.test(v) ? "'" + v : v; };
  sheet.appendRow(KEYS.map((k) => safe(d[k])));
  return ContentService.createTextOutput('ok');
}
```

3. Click Save.

## 3. Publish it
1. Deploy > New deployment > gear icon > Web app.
2. Execute as: Me. Who has access: Anyone.
3. Deploy, then Authorize access (choose your account > Advanced > Go to project > Allow).
4. Copy the Web app URL (it ends with /exec).

## 4. Connect the website
Send the URL to Claude, or paste it yourself in `src/config/integrations.ts`:

```ts
export const ENQUIRY_SHEET_URL: string = fromEnv || 'https://script.google.com/macros/s/XXXX/exec';
```

Then push to GitHub (Netlify redeploys). Submit a test enquiry - a new row should appear within seconds.
