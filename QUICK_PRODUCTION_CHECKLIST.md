# ✅ Quick Production Checklist - Receive Real Money

## What You Need to Do:

### 1. Get M-Pesa Production Credentials (Most Important!)

**Contact Safaricom:**
- 📞 Call: **0711 071 000** (Safaricom Business Care)
- 📧 Email: **business.care@safaricom.co.ke**
- 🌐 Visit: https://developer.safaricom.co.ke/

**What to Ask For:**
- "I need M-Pesa Daraja API production credentials"
- "I want to receive payments through Lipa Na M-Pesa Online"
- Request for:
  - Consumer Key (Production)
  - Consumer Secret (Production)
  - Business Short Code (Your Paybill/Till Number)
  - Passkey (Production)

**What You'll Need:**
- Your business registration documents
- KRA PIN
- ID/Passport
- Paybill or Till Number (if you don't have one, they'll help you get it)

---

### 2. Set Up Public Callback URL

Your server needs to be accessible from the internet.

**Quick Option - Use Ngrok (For Testing):**
```bash
# Download ngrok from: https://ngrok.com/download

# Run your server first
npm start

# In another terminal, run ngrok
ngrok http 3001

# Copy the HTTPS URL (e.g., https://abc123.ngrok.io)
```

**Production Option - Deploy Your Server:**
- Heroku (Free tier available)
- Railway (Free tier available)
- Render (Free tier available)
- Your own VPS/hosting

---

### 3. Update Your .env File

Once you have credentials from Safaricom:

```env
# Replace these with your REAL credentials
MPESA_CONSUMER_KEY=your_actual_consumer_key
MPESA_CONSUMER_SECRET=your_actual_consumer_secret
MPESA_BUSINESS_SHORTCODE=your_paybill_number
MPESA_PASSKEY=your_actual_passkey
MPESA_CALLBACK_URL=https://your-ngrok-or-domain.com/api/mpesa/callback

# IMPORTANT: Set to production
NODE_ENV=production
```

---

### 4. Test Everything

```bash
# Start your server
npm start

# You should see:
# 🚀 M-Pesa PRODUCTION Mode Activated
# 💰 Real money will be transferred!
```

**Test with small amount:**
1. Go to your website
2. Try donating KSH 10
3. Complete the M-Pesa prompt on your phone
4. Check if money arrives in your Paybill/Till account

---

## Current Status Check

Run this command to check your setup:
```bash
curl http://localhost:3001/api/health
```

You should see:
```json
{
  "mpesa": {
    "configured": true,
    "environment": "production"
  }
}
```

---

## ⚠️ Important Notes

1. **Sandbox vs Production:**
   - Sandbox (174379) = Testing only, no real money
   - Production (Your number) = Real money transfers

2. **Callback URL:**
   - MUST be HTTPS (not HTTP)
   - MUST be publicly accessible (not localhost)
   - Test it: Visit your callback URL in a browser

3. **Business ShortCode:**
   - This is where money will be deposited
   - Usually your Paybill or Till number
   - Verify it's active and can receive payments

4. **Security:**
   - Never share your Consumer Secret
   - Keep .env file private
   - Don't commit credentials to Git

---

## Timeline

**How long does it take?**
- Safaricom credential approval: 1-3 business days
- Setting up ngrok: 5 minutes
- Updating .env file: 2 minutes
- Testing: 5 minutes

**Total: About 1-3 days** (mostly waiting for Safaricom)

---

## What Happens When Someone Donates?

1. User fills donation form on your website
2. User receives M-Pesa prompt on their phone
3. User enters M-Pesa PIN
4. Money is deducted from user's M-Pesa
5. Money is deposited to YOUR Paybill/Till
6. You receive SMS confirmation
7. User receives thank you email
8. You receive notification email

---

## Troubleshooting

### "Invalid Access Token"
→ Your credentials are wrong. Double-check with Safaricom.

### "Callback URL not reachable"
→ Your server is not publicly accessible. Use ngrok or deploy to cloud.

### "Money not received"
→ Check your Business ShortCode is correct and active.

### "Transaction timeout"
→ User didn't complete payment within 60 seconds.

---

## Need Help?

1. **Read**: PRODUCTION_SETUP_GUIDE.md (detailed guide)
2. **Contact Safaricom**: 0711 071 000
3. **Email Safaricom**: apisupport@safaricom.co.ke
4. **Check logs**: Look at your server console for errors

---

## Quick Commands

```bash
# Start server
npm start

# Check health
curl http://localhost:3001/api/health

# View recent transactions
curl http://localhost:3001/api/admin/transactions

# Test ngrok is working
curl https://your-ngrok-url.ngrok.io/api/health
```

---

## Ready to Go Live?

- [ ] Got production credentials from Safaricom
- [ ] Updated .env file with real credentials
- [ ] Set NODE_ENV=production
- [ ] Set up public callback URL (ngrok or deployed)
- [ ] Tested with KSH 10
- [ ] Received money in your account
- [ ] Emails are working

**If all checked, you're ready to receive real donations! 🎉**
