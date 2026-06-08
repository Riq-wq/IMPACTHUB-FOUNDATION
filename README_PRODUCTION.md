# 🎯 ImpactHub Foundation - Production Setup Summary

## 📋 What You Have Now

Your donation website is **fully functional** but currently in **TEST MODE**.

- ✅ Beautiful website design
- ✅ M-Pesa payment integration
- ✅ Email notifications
- ✅ Transaction tracking
- ⚠️ **BUT**: Using sandbox mode (no real money transfers)

---

## 💰 To Receive Real Money - 3 Main Steps

### 1️⃣ Get Production Credentials from Safaricom

**Contact:**
- 📞 Phone: **0711 071 000** (Safaricom Business Care)
- 📧 Email: business.care@safaricom.co.ke
- 🌐 Portal: https://developer.safaricom.co.ke/

**What You Need:**
- Business registration documents
- KRA PIN
- Your ID/Passport
- Paybill or Till Number (they can help you get one)

**What They'll Give You:**
- Consumer Key (Production)
- Consumer Secret (Production)
- Business Short Code (Your Paybill/Till)
- Passkey (Production)

**Timeline:** 1-3 business days

---

### 2️⃣ Make Your Server Publicly Accessible

M-Pesa needs to send callbacks to your server.

**Option A: Ngrok (Quick & Easy for Testing)**
```bash
# Download from: https://ngrok.com/download
# Run your server
npm start

# In another terminal
ngrok http 3001

# Copy the HTTPS URL (e.g., https://abc123.ngrok.io)
```

**Option B: Deploy to Cloud (For Production)**
- Heroku: https://www.heroku.com/
- Railway: https://railway.app/
- Render: https://render.com/
- Your own VPS

---

### 3️⃣ Update Your .env File

Replace the sandbox credentials with your production credentials:

```env
# Production Credentials from Safaricom
MPESA_CONSUMER_KEY=your_production_consumer_key
MPESA_CONSUMER_SECRET=your_production_consumer_secret
MPESA_BUSINESS_SHORTCODE=your_paybill_or_till_number
MPESA_PASSKEY=your_production_passkey

# Your public callback URL
MPESA_CALLBACK_URL=https://your-ngrok-or-domain.com/api/mpesa/callback

# Set to production
NODE_ENV=production

# Email settings (if not already set)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
NOTIFICATION_EMAIL=your-email@gmail.com
```

---

## 🚀 How to Start

```bash
# Install dependencies (if not already done)
npm install

# Start the server
npm start
```

**You should see:**
```
🚀 M-Pesa PRODUCTION Mode Activated
💰 Real money will be transferred!
Money goes to: [Your Paybill/Till]
```

---

## ✅ Testing Checklist

Before accepting large donations:

1. **Test with KSH 10**
   - Go to your website
   - Fill donation form
   - Complete M-Pesa prompt
   - Verify money arrives in your account

2. **Check Email Notifications**
   - Donor should receive thank you email
   - You should receive notification email

3. **Verify Transaction Tracking**
   - Visit: http://localhost:3001/api/admin/transactions
   - Check transaction is recorded

4. **Test Callback**
   - Ensure your callback URL is accessible
   - Check server logs for callback data

---

## 📊 How It Works

```
User visits website
    ↓
Fills donation form
    ↓
Clicks "Donate via M-Pesa"
    ↓
Receives M-Pesa prompt on phone
    ↓
Enters M-Pesa PIN
    ↓
Money deducted from user's M-Pesa
    ↓
Money deposited to YOUR Paybill/Till ✅
    ↓
You receive SMS confirmation
    ↓
User receives thank you email
    ↓
You receive notification email
```

---

## 📁 Important Files

- **HOW_TO_RECEIVE_REAL_MONEY.md** - Simple step-by-step guide
- **PRODUCTION_SETUP_GUIDE.md** - Detailed technical guide
- **QUICK_PRODUCTION_CHECKLIST.md** - Quick checklist
- **.env** - Your configuration file (keep private!)
- **.env.example** - Template for configuration

---

## 🔒 Security Notes

- ✅ Never share your Consumer Secret
- ✅ Keep .env file private (don't commit to Git)
- ✅ Use HTTPS for callback URL
- ✅ Test with small amounts first
- ✅ Monitor transactions regularly
- ✅ Keep backup of your database

---

## 💡 Current vs Production

| Feature | Current (Sandbox) | Production |
|---------|------------------|------------|
| Money Transfer | ❌ No | ✅ Yes |
| M-Pesa Prompts | ✅ Yes | ✅ Yes |
| Email Notifications | ✅ Yes | ✅ Yes |
| Transaction Tracking | ✅ Yes | ✅ Yes |
| Business ShortCode | 174379 (Test) | Your Paybill/Till |
| Environment | Sandbox | Production |

---

## 🆘 Need Help?

1. **Read the guides:**
   - Start with: `HOW_TO_RECEIVE_REAL_MONEY.md`
   - Detailed info: `PRODUCTION_SETUP_GUIDE.md`

2. **Contact Safaricom:**
   - Phone: 0711 071 000
   - Email: business.care@safaricom.co.ke
   - API Support: apisupport@safaricom.co.ke

3. **Check server logs:**
   - Look at console output for errors
   - Check transaction database

4. **Test endpoints:**
   ```bash
   # Health check
   curl http://localhost:3001/api/health
   
   # Recent transactions
   curl http://localhost:3001/api/admin/transactions
   ```

---

## 🎉 You're Almost There!

Your system is **ready to receive real money**. You just need to:

1. ☐ Get production credentials from Safaricom
2. ☐ Set up public callback URL
3. ☐ Update .env file
4. ☐ Test with small amount
5. ☐ Start accepting donations!

**Good luck with your foundation! 💚**

---

## 📞 Quick Contacts

- **Safaricom Business Care**: 0711 071 000
- **Safaricom API Support**: apisupport@safaricom.co.ke
- **Daraja Portal**: https://developer.safaricom.co.ke/

---

*Last Updated: 2024*
