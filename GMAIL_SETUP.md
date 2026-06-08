# 📧 Gmail Setup for Email Notifications

## Your Email: mrisajuma384@gmail.com

To send automated emails (donation receipts, notifications), you need to set up a Gmail App Password.

---

## Step 1: Enable 2-Step Verification

1. Go to your Google Account: https://myaccount.google.com/
2. Click on **Security** (left sidebar)
3. Under "Signing in to Google", click **2-Step Verification**
4. Follow the steps to enable it (you'll need your phone)

---

## Step 2: Create App Password

1. Go back to **Security** page
2. Under "Signing in to Google", click **App passwords**
   - If you don't see this option, make sure 2-Step Verification is enabled
3. Click **Select app** → Choose **Mail**
4. Click **Select device** → Choose **Other (Custom name)**
5. Type: **ImpactHub Website**
6. Click **Generate**
7. **Copy the 16-character password** (it looks like: `abcd efgh ijkl mnop`)

---

## Step 3: Update Your .env File

Open your `.env` file and update:

```env
EMAIL_USER=mrisajuma384@gmail.com
EMAIL_PASS=paste_your_16_character_password_here
NOTIFICATION_EMAIL=mrisajuma384@gmail.com
```

**Important:** Remove spaces from the app password!
- If it shows: `abcd efgh ijkl mnop`
- Enter it as: `abcdefghijklmnop`

---

## Step 4: Test It

1. Restart your server:
   ```bash
   npm start
   ```

2. Make a test donation on your website

3. Check your email (mrisajuma384@gmail.com) - you should receive:
   - Notification email about the donation
   - The donor should receive a thank you email

---

## Troubleshooting

### "Invalid login" error
- Make sure 2-Step Verification is enabled
- Generate a new App Password
- Remove all spaces from the password
- Make sure you're using the App Password, not your regular Gmail password

### "Less secure app access" message
- You don't need to enable "Less secure apps"
- Use App Password instead (more secure)

### Not receiving emails
- Check spam folder
- Verify EMAIL_USER is correct
- Make sure server is running
- Check server console for errors

---

## What Emails Will Be Sent?

### 1. To Donors (after successful donation):
- Subject: "Thank You for Your Generous Donation - ImpactHub"
- Contains: Donation details, receipt, impact message

### 2. To You (mrisajuma384@gmail.com):
- Subject: "New Donation Received - KSH [amount]"
- Contains: Donor details, amount, M-Pesa receipt

### 3. Contact Form Messages:
- Now handled by Formspree
- You'll receive messages at: mrisajuma384@gmail.com
- No setup needed for this!

---

## Security Tips

✅ **DO:**
- Use App Password (not regular password)
- Keep your .env file private
- Don't share your App Password

❌ **DON'T:**
- Don't commit .env to Git
- Don't share your credentials
- Don't enable "Less secure apps"

---

## Quick Reference

**Your Email:** mrisajuma384@gmail.com  
**Your Phone:** +254 826 623 42  
**Contact Form:** Uses Formspree (already set up!)  
**Formspree URL:** https://formspree.io/f/mpqndaqr

---

## Need Help?

- **Gmail Help:** https://support.google.com/accounts/answer/185833
- **App Passwords:** https://support.google.com/accounts/answer/185833

---

**All Done!** Once you set up the App Password, your email notifications will work automatically! 📧✅
