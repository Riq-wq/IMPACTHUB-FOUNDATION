# 🔴 Deployment Failed - Troubleshooting Guide

## What Happened
Your deployment to Render failed on commit `1cc2ca4`

**Commit:** Add 4 new donation features: Live Impact Display, PDF Receipts, Anonymous Donations, and Personal Messages

---

## 🔍 STEP 1: Check the Error Logs

**This is the most important step!**

### How to View Logs:
1. Go to your Render dashboard
2. Click on your service
3. Click the **"Logs"** tab
4. Scroll to the bottom to see the error

### Common Error Messages & What They Mean:

#### Error 1: "Module not found" or "Cannot find module"
```
Error: Cannot find module 'express'
Error: Cannot find module 'firebase'
```
**Problem:** Missing dependencies
**Solution:** See "Fix 1" below

#### Error 2: "npm ERR!" or "Build failed"
```
npm ERR! code ELIFECYCLE
npm ERR! errno 1
```
**Problem:** Build script issue
**Solution:** See "Fix 2" below

#### Error 3: "Port already in use" or "EADDRINUSE"
```
Error: listen EADDRINUSE: address already in use :::3001
```
**Problem:** Port configuration issue
**Solution:** See "Fix 3" below

#### Error 4: Environment variable errors
```
Error: MPESA_CONSUMER_KEY is not defined
Firebase initialization error
```
**Problem:** Missing environment variables
**Solution:** See "Fix 4" below

---

## 🔧 COMMON FIXES

### Fix 1: Missing Dependencies

**Check if `package.json` has all dependencies:**

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.0.3",
    "nodemailer": "^6.9.1",
    "axios": "^1.3.4",
    "firebase-admin": "^11.5.0"
  }
}
```

**If any are missing, run locally:**
```bash
npm install express cors dotenv nodemailer axios firebase-admin
git add package.json package-lock.json
git commit -m "Fix: Add missing dependencies"
git push origin main
```

---

### Fix 2: Start Script Issue

**Check `package.json` has correct start script:**

```json
{
  "scripts": {
    "start": "node server.js"
  }
}
```

**If missing or wrong, update it:**
1. Open `package.json`
2. Make sure `"start": "node server.js"` exists
3. Save file
4. Commit and push:
```bash
git add package.json
git commit -m "Fix: Update start script"
git push origin main
```

---

### Fix 3: Port Configuration

**Check `server.js` uses `process.env.PORT`:**

Should be:
```javascript
const PORT = process.env.PORT || 3001;
```

NOT:
```javascript
const PORT = 3001; // Wrong for Render
```

**Render provides PORT automatically. Your code should read it from environment.**

---

### Fix 4: Environment Variables

**Make sure ALL these are set in Render:**

1. Go to Render dashboard
2. Click your service
3. Click **"Environment"** tab
4. Add/verify these variables:

**M-Pesa Variables:**
- `MPESA_CONSUMER_KEY` = Your Safaricom consumer key
- `MPESA_CONSUMER_SECRET` = Your Safaricom consumer secret
- `MPESA_BUSINESS_SHORTCODE` = Your shortcode (e.g., 174379 for sandbox)
- `MPESA_PASSKEY` = Your passkey

**Email Variables:**
- `EMAIL_USER` = Your Gmail address
- `EMAIL_PASS` = Your Gmail app password

**Firebase Variables:**
- `FIREBASE_API_KEY` = Your Firebase API key
- `FIREBASE_AUTH_DOMAIN` = project-id.firebaseapp.com
- `FIREBASE_PROJECT_ID` = Your project ID
- `FIREBASE_STORAGE_BUCKET` = project-id.appspot.com
- `FIREBASE_MESSAGING_SENDER_ID` = Your sender ID
- `FIREBASE_APP_ID` = Your app ID

**Other Variables:**
- `NODE_ENV` = production
- `MPESA_CALLBACK_URL` = Your Render URL + /api/mpesa/callback

After adding/updating, click **"Save Changes"** and Render will auto-redeploy.

---

## 🎯 STEP 2: Identify Your Specific Error

### Please copy the error message from Render logs and check:

**Question 1:** Does the error mention "module" or "package"?
→ Use Fix 1 (Dependencies)

**Question 2:** Does the error mention "script" or "npm start"?
→ Use Fix 2 (Start Script)

**Question 3:** Does the error mention "port" or "EADDRINUSE"?
→ Use Fix 3 (Port Configuration)

**Question 4:** Does the error mention environment variables or Firebase?
→ Use Fix 4 (Environment Variables)

---

## 🚀 STEP 3: Quick Verification (Run Locally First)

**Before pushing again, test locally:**

```bash
# Make sure server starts without errors
npm start

# Should see:
# "Server running on http://localhost:3001"
# "Firebase connected successfully"
# "M-Pesa Sandbox Mode Activated"
```

**If local works but Render fails:**
- Issue is likely environment variables in Render
- Or build configuration in Render

---

## 📋 STEP 4: Manual Deploy After Fix

Once you've applied a fix:

### Option A: Push to GitHub (Auto-Deploy)
```bash
git add .
git commit -m "Fix deployment issue"
git push origin main
```

### Option B: Manual Deploy in Render
1. Go to Render dashboard
2. Click "Manual Deploy"
3. Select "Clear build cache & deploy"
4. Wait for deployment

---

## 🔍 DEBUGGING CHECKLIST

Before redeploying, verify:

- [ ] `package.json` exists and has all dependencies
- [ ] `package.json` has `"start": "node server.js"`
- [ ] `server.js` uses `process.env.PORT`
- [ ] All environment variables set in Render
- [ ] `.env` file is NOT pushed to GitHub (it's in `.gitignore`)
- [ ] `node_modules` folder is NOT in GitHub
- [ ] Server runs successfully locally (`npm start`)
- [ ] No syntax errors in code

---

## 💡 MOST LIKELY CAUSES

Based on the deployment failing right after adding new features:

### 1. Firebase Configuration Issue (Most Likely)
**Symptom:** Firebase errors in logs

**Solution:**
Check `firebase-config.js` - make sure all Firebase environment variables are set in Render, not just in local `.env` file.

### 2. Missing `retry-handler.js`
**Symptom:** "Cannot find module './retry-handler'"

**Solution:**
Check if `retry-handler.js` file exists in your project. If not, we need to create it.

### 3. CSS/JS File Path Issues
**Symptom:** Server starts but site doesn't load properly

**Solution:**
Make sure all file paths are correct (case-sensitive on Linux servers).

---

## 🆘 NEXT STEPS FOR YOU

**Please do this:**

1. **Copy the full error message** from Render logs (click "Logs" tab)
2. **Tell me what the error says** (paste it here)
3. I'll give you the exact fix needed

**The error message will look something like:**
```
Error: Cannot find module 'xyz'
    at Function.Module._resolveFilename
    at Function.Module._load
    ...
```

Or:
```
npm ERR! missing script: start
```

Or:
```
Error: Firebase initialization failed
```

---

## 🔧 TEMPORARY WORKAROUND

If you need the site back online immediately:

### Rollback to Previous Working Version:

1. Go to Render dashboard
2. Click "Manual Deploy"
3. Select a previous commit (before the new features)
4. Deploy that version

This will restore your site while we fix the issue.

---

## 📞 I'M HERE TO HELP

Once you share the error logs, I can:
- ✅ Tell you exactly what's wrong
- ✅ Give you the precise fix
- ✅ Help you redeploy successfully

**Copy the error from Render logs and share it with me!**
