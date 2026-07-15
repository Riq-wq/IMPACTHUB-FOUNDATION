# 💰 How to Receive Real Money - Simple Guide

## Current Situation
Right now, you're using **TEST MODE** (Sandbox). When people donate, NO REAL MONEY is transferred.

## To Receive REAL Money:

### Step 1: Call Safaricom (Most Important!)
📞 **Call: 0711 071 000**

Say: *"I need M-Pesa Daraja API production credentials to receive payments online"*

They will ask for:
- Your business documents
- KRA PIN
- Your ID
- Paybill or Till number (they can help you get one)

They will give you:
- Consumer Key
- Consumer Secret  
- Business Short Code (your Paybill/Till)
- Passkey

**This takes 1-3 business days.**

---

### Step 2: Make Your Server Public

Your website needs to be accessible from the internet.

**Easiest way - Use Ngrok:**

1. Download ngrok: https://ngrok.com/download
2. Run your server: `npm start`
3. In another terminal: `ngrok http 3001`
4. Copy the HTTPS URL (like: `https://abc123.ngrok.io`)

---

### Step 3: Update Your .env File

Open your `.env` file and replace with the credentials Safaricom gave you:

```env
MPESA_CONSUMER_KEY=paste_your_real_consumer_key_here
MPESA_CONSUMER_SECRET=paste_your_real_consumer_secret_here
MPESA_BUSINESS_SHORTCODE=your_paybill_or_till_number
MPESA_PASSKEY=paste_your_real_passkey_here
MPESA_CALLBACK_URL=https://your-ngrok-url.ngrok.io/api/mpesa/callback
NODE_ENV=production
```

**Save the file.**

---

### Step 4: Restart Your Server

```bash
npm start
```

You should see:
```
🚀 M-Pesa PRODUCTION Mode Activated
💰 Real money will be transferred!
```

---

### Step 5: Test It!

1. Go to your website
2. Donate KSH 10 (small amount for testing)
3. Enter your M-Pesa PIN when prompted
4. Check your Paybill/Till account - money should be there!

---

## That's It! 🎉

Once you complete these 5 steps, every donation will send REAL MONEY to your M-Pesa account.

---

## Important Notes:

✅ **Money goes to**: Your Business ShortCode (Paybill/Till number)

✅ **You'll receive**: SMS notification for each payment

✅ **Donor receives**: Thank you email with receipt

✅ **You receive**: Email notification for each donation

---

## Need Help?

- **Safaricom Support**: 0711 071 000
- **Email**: business.care@safaricom.co.ke
- **More details**: Read `PRODUCTION_SETUP_GUIDE.md`

---

## Quick Check - Are You Ready?

- [ ] Called Safaricom and got production credentials
- [ ] Updated .env file with real credentials
- [ ] Set NODE_ENV=production
- [ ] Server is publicly accessible (ngrok or deployed)
- [ ] Tested with KSH 10 and received money

**All done? You're ready to receive real donations!** 💰
