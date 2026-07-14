# 🚀 Render.com Deployment Guide

## How to Check Your Render Deployment Status

### Step 1: Access Your Render Dashboard
1. Go to: https://dashboard.render.com/project/prj-d8jftff7f7vs73bdano0
2. Login if needed
3. You should see your service listed

---

## What to Look For

### ✅ **Deployment Status:**

**🟢 Live/Active**
- Your app is running successfully
- Green indicator
- Shows "Live" status
- Your website is accessible

**🟡 Building/Deploying**
- Deployment in progress
- Yellow/orange indicator
- Wait for it to complete (usually 2-5 minutes)

**🔴 Failed/Error**
- Deployment failed
- Red indicator
- Check logs for errors

---

## After Pushing New Changes

### What Happens:
1. GitHub receives your push
2. Render detects the change (if auto-deploy is enabled)
3. Render starts building your app
4. Render deploys the new version
5. Your live site updates automatically

### Timeline:
- **Detection:** Instant
- **Build:** 2-5 minutes
- **Deploy:** 30 seconds - 1 minute
- **Total:** ~3-6 minutes

---

## How to Trigger Deployment

### Option 1: Auto-Deploy (Recommended)
If enabled, Render automatically deploys when you push to GitHub.

**Check if enabled:**
1. Go to your service settings
2. Look for "Auto-Deploy" toggle
3. Should be set to "Yes"
4. Branch should be "main"

### Option 2: Manual Deploy
If auto-deploy is off:
1. Click on your service
2. Click "Manual Deploy" button
3. Select "Deploy latest commit"
4. Wait for deployment to complete

---

## Checking Deployment Logs

### To See What's Happening:
1. Click on your service in Render dashboard
2. Click "Logs" tab
3. Watch the deployment process in real-time

### What to Look For:
```
✅ Good Signs:
- "Cloning repository..."
- "Installing dependencies..."
- "npm install completed"
- "Starting server..."
- "Server running on port..."
- "Your service is live"

❌ Error Signs:
- "Build failed"
- "npm ERR!"
- "Module not found"
- "Port already in use"
- "Deployment failed"
```

---

## Common Issues & Solutions

### Issue 1: Build Fails - Missing Dependencies
**Error:** "Cannot find module..."

**Solution:**
```bash
# Make sure package.json includes all dependencies
npm install
git add package.json package-lock.json
git commit -m "Update dependencies"
git push origin main
```

### Issue 2: Environment Variables Not Set
**Error:** "M-Pesa credentials not configured"

**Solution:**
1. Go to Render dashboard
2. Click your service
3. Click "Environment" tab
4. Add these variables:
   - `MPESA_CONSUMER_KEY`
   - `MPESA_CONSUMER_SECRET`
   - `MPESA_BUSINESS_SHORTCODE`
   - `MPESA_PASSKEY`
   - `EMAIL_USER`
   - `EMAIL_PASS`
   - `FIREBASE_API_KEY`
   - `FIREBASE_AUTH_DOMAIN`
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_STORAGE_BUCKET`
   - `FIREBASE_MESSAGING_SENDER_ID`
   - `FIREBASE_APP_ID`
5. Save changes
6. Render will auto-redeploy

### Issue 3: Port Configuration
**Error:** "Port binding failed"

**Solution:**
Check `server.js` uses:
```javascript
const PORT = process.env.PORT || 3001;
```

Render automatically sets `process.env.PORT`.

### Issue 4: Start Command Not Found
**Error:** "Start script not found"

**Solution:**
Make sure `package.json` has:
```json
{
  "scripts": {
    "start": "node server.js"
  }
}
```

---

## Verifying New Features Are Live

### After Deployment Completes:

1. **Visit Your Live URL:**
   - Find URL in Render dashboard (e.g., `https://your-app.onrender.com`)
   - Click to open in browser

2. **Hard Refresh:**
   - Press `Ctrl + Shift + R` (or `Cmd + Shift + R` on Mac)
   - Clears cache and loads fresh code

3. **Check New Features:**
   - ✅ Live Impact Display (below hero section)
   - ✅ Anonymous donation checkbox
   - ✅ Personal message field
   - ✅ Download receipt button (after payment)

---

## Deployment Checklist

### Before Deployment:
- [x] Code pushed to GitHub
- [ ] Check Render auto-deploy is enabled
- [ ] Environment variables are set
- [ ] package.json has correct start script

### During Deployment:
- [ ] Watch logs for errors
- [ ] Wait for "Live" status
- [ ] Check deployment time (should be 3-6 minutes)

### After Deployment:
- [ ] Visit live URL
- [ ] Hard refresh browser (Ctrl + Shift + R)
- [ ] Test donation flow
- [ ] Check impact display
- [ ] Test anonymous donation
- [ ] Test receipt download

---

## Getting Your Live URL

### Find Your Website URL:
1. Go to Render dashboard
2. Click on your service
3. Look for "Your service is live at:"
4. URL format: `https://your-service-name.onrender.com`
5. Copy and share this URL!

---

## Monitoring Your Live Site

### Health Check:
Visit: `https://your-app.onrender.com/api/health`

Should return:
```json
{
  "status": "healthy",
  "timestamp": "...",
  "mpesa": { "configured": true },
  "email": { "configured": true }
}
```

### Admin Dashboard:
Visit: `https://your-app.onrender.com/admin.html`

Check:
- Total donations
- Recent transactions
- Live statistics

---

## Free Tier Considerations

### Render Free Tier:
- ✅ 750 hours/month free
- ✅ Sleeps after 15 minutes of inactivity
- ⚠️ First request after sleep takes 30-60 seconds
- ✅ Wakes up automatically when accessed

### To Keep Active:
1. Use uptime monitoring service (like UptimeRobot)
2. Ping your site every 10 minutes
3. Or upgrade to paid plan ($7/month for always-on)

---

## Troubleshooting Steps

### If Site Not Loading:

1. **Check Render Status:**
   - Dashboard shows "Live"?
   - No red error indicators?

2. **Check Logs:**
   - Any error messages?
   - Server started successfully?

3. **Check URL:**
   - Using correct Render URL?
   - Not localhost:3001?

4. **Hard Refresh:**
   - Ctrl + Shift + R
   - Clears browser cache

5. **Check Environment Variables:**
   - All variables set correctly?
   - No typos in variable names?

---

## Need to Redeploy?

### Manual Redeploy:
1. Go to Render dashboard
2. Click your service
3. Click "Manual Deploy" → "Clear build cache & deploy"
4. Wait for completion

### Force Fresh Deploy:
```bash
# Make a small change and push
git commit --allow-empty -m "Trigger redeploy"
git push origin main
```

---

## Support Resources

### Render Documentation:
- https://render.com/docs

### Check Service Status:
- https://status.render.com/

### Your Dashboard:
- https://dashboard.render.com/project/prj-d8jftff7f7vs73bdano0

---

## Quick Checklist

After pushing new features, verify:

- [ ] Render shows "Deploying..."
- [ ] Wait 3-6 minutes
- [ ] Status changes to "Live"
- [ ] Visit live URL
- [ ] Hard refresh (Ctrl + Shift + R)
- [ ] See new impact display section
- [ ] Test anonymous donation checkbox
- [ ] Test personal message field
- [ ] Complete test donation
- [ ] Download receipt works

---

## 🎉 Success Indicators

You'll know deployment worked when:

✅ Render dashboard shows green "Live" status
✅ Your live URL loads the website
✅ Impact display shows below hero section
✅ Donation form has anonymous checkbox
✅ Message field appears in form
✅ Receipt downloads after successful payment
✅ Admin dashboard shows updated stats

---

**Your new features should be live within 5-10 minutes of pushing to GitHub!**

If you see any errors, check the logs in Render dashboard and let me know what they say.
