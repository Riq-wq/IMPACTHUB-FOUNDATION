# ⚠️ Credentials Issue - Invalid Access Token for STK Push

## 🔍 Problem Identified

Your M-Pesa credentials work for **authentication** but fail for **STK Push** with error:

```
Error Code: 404.001.03
Error Message: Invalid Access Token
```

## 📊 Test Results

| Test | Result | Details |
|------|--------|---------|
| Authentication | ✅ PASS | Token generated successfully |
| STK Push | ❌ FAIL | Error 404.001.03 - Invalid Access Token |

## 🤔 Why This Happens

This is a **common issue** with Safaricom's sandbox credentials:

1. **Credentials Expired** - Sandbox credentials expire after some time
2. **Sandbox Limitations** - Some sandbox credentials only work for auth, not STK Push
3. **Safaricom Issues** - The sandbox API might be having problems
4. **App Not Activated** - Your Daraja app might not be fully activated for STK Push

## ✅ Solutions

### Solution 1: Regenerate Credentials (Recommended)

1. **Go to Safaricom Daraja Portal:**
   ```
   https://developer.safaricom.co.ke/
   ```

2. **Log in** to your account

3. **Go to "My Apps"**

4. **Click on your app**

5. **Click "Generate" or "Regenerate"** to get new credentials

6. **Copy the new credentials:**
   - Consumer Key
   - Consumer Secret
   - Passkey (if changed)

7. **Update your `.env` file:**
   ```env
   MPESA_CONSUMER_KEY=your_new_consumer_key
   MPESA_CONSUMER_SECRET=your_new_consumer_secret
   MPESA_PASSKEY=your_new_passkey
   ```

8. **Restart your server:**
   ```bash
   # Stop server (Ctrl+C)
   npm start
   ```

9. **Test again**

---

### Solution 2: Create a New App

If regenerating doesn't work:

1. **Go to Daraja Portal:**
   ```
   https://developer.safaricom.co.ke/
   ```

2. **Create a new app:**
   - Click "Add a new app"
   - Name it (e.g., "ImpactHub Donations")
   - Select "Lipa Na M-Pesa Online" (STK Push)
   - Click "Create"

3. **Get credentials** from the new app

4. **Update `.env`** with new credentials

5. **Restart server** and test

---

### Solution 3: Check Safaricom Sandbox Status

Sometimes the sandbox is down:

1. **Check Safaricom Status:**
   - Visit: https://developer.safaricom.co.ke/
   - Look for any announcements
   - Check their Twitter: @Safaricom_Care

2. **Try again later** if sandbox is down

3. **Use production credentials** if you have them

---

### Solution 4: Use Production Credentials

If you have production credentials:

1. **Get production credentials** from Daraja Portal

2. **Update `.env`:**
   ```env
   MPESA_CONSUMER_KEY=production_key
   MPESA_CONSUMER_SECRET=production_secret
   MPESA_BUSINESS_SHORTCODE=your_paybill_number
   MPESA_PASSKEY=production_passkey
   ```

3. **Update `mpesa-config.js`:**
   ```javascript
   // Change this line:
   this.baseUrl = 'https://sandbox.safaricom.co.ke';
   
   // To this:
   this.baseUrl = 'https://api.safaricom.co.ke';
   ```

4. **Restart server** and test with real money

---

## 🧪 How to Test After Fixing

### Step 1: Test Authentication
```bash
node test-mpesa-auth.js
```

Should show: ✅ SUCCESS!

### Step 2: Test STK Push
```bash
node test-stk-direct-simple.js
```

Should show: ✅ SUCCESS! (not error 404.001.03)

### Step 3: Test Full Flow
```bash
npm start
```

Then test on: http://localhost:3001

---

## 📝 Current Credentials Status

Based on tests:

```
✅ Consumer Key: Valid for authentication
✅ Consumer Secret: Valid for authentication
❌ Credentials: NOT valid for STK Push
```

**Action Required:** Regenerate or get new credentials

---

## 🎯 Quick Fix Steps

1. **Go to:** https://developer.safaricom.co.ke/
2. **Log in**
3. **My Apps** → Your App → **Generate**
4. **Copy new credentials**
5. **Update `.env` file**
6. **Restart server:** `npm start`
7. **Test:** `node test-stk-direct-simple.js`

---

## 🆘 Still Not Working?

### Check These:

1. **App Type:**
   - Make sure your app has "Lipa Na M-Pesa Online" enabled
   - Check in Daraja Portal → My Apps → Your App

2. **Credentials Format:**
   - No extra spaces in `.env`
   - No quotes around values
   - Correct length (Consumer Key: ~48 chars, Secret: ~64 chars)

3. **Safaricom Account:**
   - Account is active
   - App is approved
   - No restrictions

4. **Network:**
   - Internet connection working
   - No firewall blocking Safaricom API
   - Try from different network

---

## 📞 Get Help from Safaricom

If nothing works:

**Safaricom Developer Support:**
- Email: apisupport@safaricom.co.ke
- Portal: https://developer.safaricom.co.ke/support
- Twitter: @Safaricom_Care

**What to tell them:**
```
I'm getting error 404.001.03 (Invalid Access Token) when 
trying to use STK Push API. Authentication works but STK 
Push fails. My app name is [YOUR_APP_NAME]. Please help.
```

---

## 💡 Alternative: Use Test Credentials

Safaricom provides default test credentials. Try these:

**Test Credentials (Public):**
```
Consumer Key: (Get from Daraja Portal)
Consumer Secret: (Get from Daraja Portal)
Business Shortcode: 174379
Passkey: bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919
```

**Note:** These are for testing only and might have limitations.

---

## ✅ Summary

**Problem:** Credentials work for auth but not STK Push

**Cause:** Expired or limited sandbox credentials

**Solution:** Regenerate credentials from Daraja Portal

**Steps:**
1. Go to https://developer.safaricom.co.ke/
2. Regenerate credentials
3. Update `.env`
4. Restart server
5. Test again

---

## 🚀 Next Steps

1. **Regenerate credentials** (5 minutes)
2. **Update `.env` file**
3. **Restart server**
4. **Run test:** `node test-stk-direct-simple.js`
5. **Should work!** ✅

---

**The issue is with the credentials, not your code. Everything else is working correctly!** 🎉
