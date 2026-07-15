# M-Pesa Payment Troubleshooting Guide

## Common Error: "Payment Failed - Error processing payment request"

This error can occur for several reasons. Follow these steps to diagnose and fix the issue:

---

## Step 1: Check Server Logs

Start your server and look for detailed error messages:

```bash
node server.js
```

Look for messages like:
- `⚠️ WARNING: Using default callback URL`
- `Error getting access token`
- `M-Pesa API Error`
- `Failed to initiate STK Push`

---

## Step 2: Verify M-Pesa Credentials

### Check your `.env` file:

```env
MPESA_CONSUMER_KEY=your_consumer_key_here
MPESA_CONSUMER_SECRET=your_consumer_secret_here
MPESA_BUSINESS_SHORTCODE=174379
MPESA_PASSKEY=your_passkey_here
MPESA_CALLBACK_URL=https://your-public-url.com/api/mpesa/callback
```

### For Sandbox Testing:
- **Consumer Key**: Get from [Safaricom Daraja Portal](https://developer.safaricom.co.ke/)
- **Consumer Secret**: Get from Daraja Portal
- **Business Shortcode**: Use `174379` for sandbox
- **Passkey**: Get from Daraja Portal (sandbox passkey)
- **Callback URL**: Must be a publicly accessible URL

---

## Step 3: Fix the Callback URL Issue

### The Problem:
The default callback URL `https://mydomain.com/pat` is not accessible by M-Pesa servers. This prevents you from receiving payment confirmations.

### Solutions:

#### Option A: Use ngrok (Recommended for Testing)

1. **Install ngrok:**
   ```bash
   # Download from https://ngrok.com/download
   # Or use npm
   npm install -g ngrok
   ```

2. **Start your server:**
   ```bash
   node server.js
   ```

3. **In a new terminal, start ngrok:**
   ```bash
   ngrok http 3001
   ```

4. **Copy the HTTPS URL** (e.g., `https://abc123.ngrok.io`)

5. **Update your `.env` file:**
   ```env
   MPESA_CALLBACK_URL=https://abc123.ngrok.io/api/mpesa/callback
   ```

6. **Restart your server**

#### Option B: Deploy to a Public Server

Deploy your application to:
- Heroku
- Railway
- Render
- DigitalOcean
- AWS

Then use your public URL as the callback URL.

#### Option C: Test Without Callbacks (Limited)

For basic testing, you can proceed without a valid callback URL, but:
- ❌ You won't receive payment confirmations
- ❌ Status checking won't work properly
- ❌ Emails won't be sent automatically
- ✅ STK Push will still be sent to the phone

---

## Step 4: Test M-Pesa Credentials

Create a test file `test-mpesa-auth.js`:

```javascript
require('dotenv').config();
const axios = require('axios');

async function testAuth() {
    try {
        const consumerKey = process.env.MPESA_CONSUMER_KEY;
        const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
        
        console.log('Testing M-Pesa Authentication...');
        console.log('Consumer Key:', consumerKey ? '✓ Set' : '✗ Not Set');
        console.log('Consumer Secret:', consumerSecret ? '✓ Set' : '✗ Not Set');
        
        if (!consumerKey || !consumerSecret) {
            console.error('❌ Credentials not set in .env file');
            return;
        }
        
        const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
        
        const response = await axios.get(
            'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
            {
                headers: {
                    'Authorization': `Basic ${auth}`
                }
            }
        );
        
        if (response.data.access_token) {
            console.log('✅ Authentication Successful!');
            console.log('Access Token:', response.data.access_token.substring(0, 20) + '...');
            console.log('Expires In:', response.data.expires_in, 'seconds');
        }
    } catch (error) {
        console.error('❌ Authentication Failed!');
        console.error('Error:', error.response?.data || error.message);
        
        if (error.response?.status === 401) {
            console.error('\n⚠️  Invalid credentials. Please check:');
            console.error('1. Consumer Key is correct');
            console.error('2. Consumer Secret is correct');
            console.error('3. Credentials are from Safaricom Daraja Portal');
        }
    }
}

testAuth();
```

Run it:
```bash
node test-mpesa-auth.js
```

---

## Step 5: Common Error Messages

### Error: "Failed to get M-Pesa access token"
**Cause:** Invalid credentials
**Solution:** 
- Verify your Consumer Key and Secret in `.env`
- Make sure there are no extra spaces
- Get fresh credentials from Daraja Portal

### Error: "Invalid phone number format"
**Cause:** Phone number not in correct format
**Solution:** 
- Use format: `254712345678` (Kenya)
- Remove spaces, dashes, or parentheses
- Must start with country code (254 for Kenya)

### Error: "Amount must be between KSH 1 and KSH 150,000"
**Cause:** Amount out of range
**Solution:** 
- Enter amount between 1 and 150,000
- Use whole numbers only

### Error: "M-Pesa API Error: [error message]"
**Cause:** M-Pesa rejected the request
**Solution:** 
- Check the specific error message in server logs
- Common issues:
  - Invalid business shortcode
  - Invalid passkey
  - Callback URL not accessible
  - Phone number not registered for M-Pesa

---

## Step 6: Test with Safaricom Test Numbers

For sandbox testing, use Safaricom's test credentials:

**Test Phone Numbers:**
- `254708374149`
- `254711111111`

**Test Amount:** Any amount between 1 and 150,000

**Expected Behavior:**
1. STK Push sent to phone
2. Enter PIN: `1234` (sandbox test PIN)
3. Payment should complete successfully

---

## Step 7: Enable Debug Mode

Add more logging to see what's happening:

In `server.js`, the endpoint now has detailed logging. Check the console for:

```
=== Received STK Push Request ===
Request Body: { fullName, email, phone, amount, cause }
Processing M-Pesa donation: ...
Initiating STK Push...
STK Push Result: ...
=== STK Push Request Completed Successfully ===
```

If you see an error, it will show:
```
=== Error in STK Push Endpoint ===
Error Message: ...
Error Stack: ...
```

---

## Step 8: Check Browser Console

Open browser Developer Tools (F12) and check the Console tab for:

```javascript
// Successful request
{
  success: true,
  message: "Payment request sent to your phone",
  checkoutRequestId: "ws_CO_..."
}

// Failed request
{
  success: false,
  message: "Error message here",
  error: "Detailed error (development mode only)"
}
```

---

## Step 9: Verify Server is Running

Make sure your server is running on the correct port:

```bash
node server.js
```

You should see:
```
🚀 ImpactHub Server running on http://localhost:3001
📱 M-Pesa Integration: ✅ Configured
📧 Email Service: ✅ Configured
🌍 Environment: development
```

---

## Step 10: Test the API Directly

Use curl or Postman to test the endpoint:

```bash
curl -X POST http://localhost:3001/api/mpesa/stkpush \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "email": "john@example.com",
    "phone": "254712345678",
    "amount": 10,
    "cause": "Healthcare"
  }'
```

---

## Quick Checklist

Before testing, verify:

- [ ] Server is running (`node server.js`)
- [ ] `.env` file has all M-Pesa credentials
- [ ] Consumer Key and Secret are correct
- [ ] Business Shortcode is `174379` (sandbox)
- [ ] Passkey is correct
- [ ] Callback URL is publicly accessible (or using ngrok)
- [ ] Phone number is in format `254XXXXXXXXX`
- [ ] Amount is between 1 and 150,000
- [ ] Internet connection is stable

---

## Still Having Issues?

1. **Check Safaricom Daraja Status:**
   - Visit [Safaricom Daraja](https://developer.safaricom.co.ke/)
   - Check if sandbox is operational

2. **Review Server Logs:**
   - Look for detailed error messages
   - Check for network issues
   - Verify API responses

3. **Test with Minimal Setup:**
   - Use the test script above
   - Try with test phone numbers
   - Use small amounts (e.g., KSH 1)

4. **Contact Support:**
   - Safaricom Daraja Support: [developer.safaricom.co.ke](https://developer.safaricom.co.ke/)
   - Check Daraja documentation
   - Review API changelog for updates

---

## Production Deployment

When moving to production:

1. **Get Production Credentials:**
   - Apply for production access on Daraja Portal
   - Get production Consumer Key and Secret
   - Get production Business Shortcode (your actual paybill/till)
   - Get production Passkey

2. **Update `.env`:**
   ```env
   MPESA_CONSUMER_KEY=production_key
   MPESA_CONSUMER_SECRET=production_secret
   MPESA_BUSINESS_SHORTCODE=your_paybill_number
   MPESA_PASSKEY=production_passkey
   MPESA_CALLBACK_URL=https://yourdomain.com/api/mpesa/callback
   NODE_ENV=production
   ```

3. **Update Base URL in `mpesa-config.js`:**
   ```javascript
   this.baseUrl = 'https://api.safaricom.co.ke'; // Production URL
   ```

4. **Test Thoroughly:**
   - Test with real phone numbers
   - Test with small amounts first
   - Verify callbacks are received
   - Check email notifications
   - Monitor transaction logs

---

## Need Help?

If you're still experiencing issues after following this guide:

1. Check the server console for detailed error messages
2. Review the browser console for client-side errors
3. Verify all credentials are correct
4. Ensure callback URL is accessible
5. Test with Safaricom's test numbers first

Good luck! 🚀
