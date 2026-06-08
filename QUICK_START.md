# Quick Start Guide - M-Pesa Payment Integration

## 🚀 Get Started in 5 Minutes

### Step 1: Test Your M-Pesa Credentials

Run the authentication test:

```bash
node test-mpesa-auth.js
```

**Expected Output:**
```
✅ SUCCESS! Authentication Successful!
Access Token: eyJ0eXAiOiJKV1QiLCJhbGc...
Expires In: 3599 seconds
```

**If you see errors:**
- Check your `.env` file
- Verify credentials are correct
- Read `TROUBLESHOOTING.md`

---

### Step 2: Set Up Callback URL (Important!)

#### Option A: Using ngrok (Recommended for Testing)

1. **Install ngrok:**
   ```bash
   npm install -g ngrok
   ```

2. **Start your server in one terminal:**
   ```bash
   node server.js
   ```

3. **Start ngrok in another terminal:**
   ```bash
   ngrok http 3001
   ```

4. **Copy the HTTPS URL** (looks like: `https://abc123.ngrok.io`)

5. **Update `.env` file:**
   ```env
   MPESA_CALLBACK_URL=https://abc123.ngrok.io/api/mpesa/callback
   ```

6. **Restart your server** (Ctrl+C and run `node server.js` again)

#### Option B: Skip for Now (Limited Testing)

You can test STK Push without callbacks, but you won't receive payment confirmations.

---

### Step 3: Start the Server

```bash
node server.js
```

**You should see:**
```
🚀 ImpactHub Server running on http://localhost:3001
📱 M-Pesa Integration: ✅ Configured
📧 Email Service: ✅ Configured
🌍 Environment: development
```

---

### Step 4: Test the Payment Flow

1. **Open your browser:**
   ```
   http://localhost:3001
   ```

2. **Scroll to the "Donate" section**

3. **Fill in the form:**
   - **Full Name:** John Doe
   - **Email:** your-email@example.com
   - **Phone:** `254708374149` (Safaricom test number)
   - **Amount:** Select `KSH 3,250` or enter `10`
   - **Cause:** Healthcare (optional)

4. **Click "Donate via M-Pesa"**

5. **Watch the modal:**
   - Should show "Sending Payment Request..."
   - Then "Check Your Phone"
   - Instructions appear with countdown timer

6. **Check your phone** (if using real number) or **check server logs** (if using test number)

7. **For sandbox testing:**
   - Use test phone: `254708374149`
   - Enter PIN: `1234` (sandbox test PIN)
   - Payment should complete

---

### Step 5: Monitor the Process

#### In the Browser:
- Modal shows real-time status
- Countdown timer (60 seconds)
- Success message with receipt number
- Or error message if something fails

#### In the Server Console:
```
=== Received STK Push Request ===
Request Body: { fullName, email, phone, amount, cause }
Processing M-Pesa donation: ...
Initiating STK Push...
✅ STK Push Request Completed Successfully
```

---

## 📱 Test Phone Numbers (Sandbox)

Use these Safaricom test numbers for sandbox testing:

- `254708374149`
- `254711111111`

**Test PIN:** `1234`

---

## 💰 Test Amounts

- Minimum: KSH 1
- Maximum: KSH 150,000
- Recommended for testing: KSH 10

---

## ✅ Success Indicators

### Payment Successful:
- ✅ Green checkmark icon
- ✅ "Payment Successful!" message
- ✅ M-Pesa receipt number displayed
- ✅ Confirmation email sent
- ✅ Transaction saved in database

### In Server Logs:
```
Payment successful for: John Doe Receipt: ABC123XYZ
Confirmation emails sent successfully
Transaction ABC123 processed: SUCCESS
```

---

## ❌ Common Issues

### Issue 1: "Payment Failed"
**Solution:** Run `node test-mpesa-auth.js` to verify credentials

### Issue 2: "No response from phone"
**Solution:** 
- Check phone number format (254XXXXXXXXX)
- Use test numbers for sandbox
- Verify phone has M-Pesa registered

### Issue 3: "Callback URL warning"
**Solution:** Set up ngrok (see Step 2)

### Issue 4: "Invalid credentials"
**Solution:** 
- Check `.env` file
- Verify no extra spaces in credentials
- Get fresh credentials from Daraja Portal

---

## 🔧 Configuration Checklist

Before testing, verify your `.env` file:

```env
# M-Pesa Credentials (Required)
MPESA_CONSUMER_KEY=your_key_here
MPESA_CONSUMER_SECRET=your_secret_here
MPESA_BUSINESS_SHORTCODE=174379
MPESA_PASSKEY=your_passkey_here

# Callback URL (Important!)
MPESA_CALLBACK_URL=https://your-ngrok-url.ngrok.io/api/mpesa/callback

# Email (Optional for testing)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Server
PORT=3001
NODE_ENV=development
```

---

## 📚 Next Steps

1. **Test with real phone number:**
   - Use your own Safaricom number
   - Enter real amount
   - Complete payment with your PIN

2. **Check email notifications:**
   - Configure email settings in `.env`
   - Test confirmation emails

3. **Review transactions:**
   - Check `data/transactions.json`
   - View transaction history

4. **Customize the UI:**
   - Edit `index.html` for content
   - Modify `css/style.css` for styling
   - Update `js/mpesa-handler.js` for behavior

5. **Deploy to production:**
   - Get production credentials
   - Deploy to a public server
   - Update callback URL
   - Test thoroughly

---

## 🆘 Need Help?

1. **Run the auth test:**
   ```bash
   node test-mpesa-auth.js
   ```

2. **Check server logs** for detailed error messages

3. **Read the troubleshooting guide:**
   - See `TROUBLESHOOTING.md`

4. **Check Safaricom Daraja:**
   - [developer.safaricom.co.ke](https://developer.safaricom.co.ke/)

---

## 🎉 You're Ready!

Your M-Pesa payment integration is now set up and ready to test. Follow the steps above to process your first payment.

**Happy Testing! 🚀**
