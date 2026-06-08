# 🚀 M-Pesa Production Setup Guide - Receive Real Money

## Current Status
You're currently using **SANDBOX MODE** - this is for testing only and no real money is transferred.

To receive **REAL MONEY** to your M-Pesa number, follow these steps:

---

## Step 1: Get M-Pesa Production Credentials

### Option A: Paybill Number (Recommended for Organizations)
1. **Visit Safaricom Daraja Portal**: https://developer.safaricom.co.ke/
2. **Create an Account** or **Login**
3. **Create a Production App**:
   - Go to "My Apps"
   - Click "Add a new app"
   - Select "Lipa Na M-Pesa Online"
   - Fill in your details
4. **Get Your Credentials**:
   - Consumer Key
   - Consumer Secret
   - Business Short Code (Your Paybill Number)
   - Passkey (Request from Safaricom)

### Option B: Till Number (For Small Businesses)
1. Contact Safaricom Business Care: **0711 071 000**
2. Request for:
   - Till Number activation for online payments
   - Daraja API access
   - Production credentials

### Option C: Buy Goods (For Individual Merchants)
1. You need a registered **Buy Goods Till Number**
2. Contact Safaricom to enable API access
3. Get your production credentials

---

## Step 2: Register Your Callback URL

Your callback URL must be **publicly accessible** (not localhost).

### Options for Callback URL:

#### Option 1: Use Ngrok (For Testing)
```bash
# Install ngrok
# Download from: https://ngrok.com/download

# Run ngrok
ngrok http 3001

# Copy the HTTPS URL (e.g., https://abc123.ngrok.io)
# Your callback URL will be: https://abc123.ngrok.io/api/mpesa/callback
```

#### Option 2: Deploy to Cloud (Recommended for Production)
- **Heroku**: https://www.heroku.com/
- **Railway**: https://railway.app/
- **Render**: https://render.com/
- **DigitalOcean**: https://www.digitalocean.com/
- **AWS/Azure/Google Cloud**

#### Option 3: Use Your Own Domain
If you have a website with a domain:
```
https://yourdomain.com/api/mpesa/callback
```

---

## Step 3: Update Your .env File

Once you have your production credentials, update your `.env` file:

```env
# M-Pesa PRODUCTION Configuration
MPESA_CONSUMER_KEY=your_production_consumer_key_here
MPESA_CONSUMER_SECRET=your_production_consumer_secret_here
MPESA_BUSINESS_SHORTCODE=your_paybill_or_till_number
MPESA_PASSKEY=your_production_passkey_here
MPESA_CALLBACK_URL=https://your-public-url.com/api/mpesa/callback

# Set to production
NODE_ENV=production
```

### Important Notes:
- **Business ShortCode**: This is where money will be received
  - For Paybill: Use your Paybill number (e.g., 123456)
  - For Till: Use your Till number (e.g., 987654)
- **Passkey**: Request this from Safaricom support
- **Callback URL**: MUST be HTTPS and publicly accessible

---

## Step 4: Update mpesa-config.js

I'll update the file to support production mode automatically.

---

## Step 5: Register Your Callback URLs with Safaricom

You need to register your callback URLs with Safaricom:

### C2B (Customer to Business) URLs:
```javascript
// Validation URL
https://your-domain.com/api/mpesa/validation

// Confirmation URL
https://your-domain.com/api/mpesa/confirmation
```

### How to Register:
1. Use Safaricom's C2B Register URL API
2. Or contact Safaricom support to register manually
3. Provide your validation and confirmation URLs

---

## Step 6: Test in Production

### Test with Small Amount First:
1. Start your server
2. Make a donation of KSH 10
3. Check if you receive the money in your M-Pesa account
4. Verify the callback is working

### Monitor Transactions:
```bash
# View recent transactions
curl http://localhost:3001/api/admin/transactions

# Check server health
curl http://localhost:3001/api/health
```

---

## Step 7: Security Checklist

Before going live:

- [ ] Use HTTPS for your callback URL
- [ ] Keep your credentials in `.env` file (never commit to Git)
- [ ] Add authentication to admin endpoints
- [ ] Set up proper error logging
- [ ] Test with small amounts first
- [ ] Have a backup of your database
- [ ] Set up email notifications for all transactions
- [ ] Monitor your M-Pesa account regularly

---

## Common Issues & Solutions

### Issue 1: "Invalid Access Token"
**Solution**: Your credentials are incorrect or expired
- Verify Consumer Key and Secret
- Check if you're using production credentials (not sandbox)

### Issue 2: "Callback URL not reachable"
**Solution**: Your callback URL is not publicly accessible
- Use ngrok for testing
- Deploy to a cloud service
- Ensure HTTPS is enabled

### Issue 3: "Transaction not completing"
**Solution**: Callback not being received
- Check your callback URL is registered with Safaricom
- Verify your server is running and accessible
- Check server logs for errors

### Issue 4: "Money not received"
**Solution**: Check your Business ShortCode
- Ensure you're using the correct Paybill/Till number
- Verify the number is active and can receive payments
- Contact Safaricom if money is stuck

---

## Quick Start for Production

1. **Get credentials from Safaricom**
2. **Update .env file** with production credentials
3. **Deploy your server** to a public URL (or use ngrok)
4. **Update callback URL** in .env
5. **Test with KSH 10**
6. **Monitor transactions**

---

## Support Contacts

### Safaricom Support:
- **Business Care**: 0711 071 000
- **Email**: business.care@safaricom.co.ke
- **Daraja Support**: apisupport@safaricom.co.ke

### Developer Portal:
- **Website**: https://developer.safaricom.co.ke/
- **Documentation**: https://developer.safaricom.co.ke/Documentation

---

## Cost Information

### M-Pesa Transaction Charges:
- **Paybill**: Usually 0-1% per transaction
- **Till Number**: Varies by agreement
- **Buy Goods**: Standard M-Pesa rates apply

Contact Safaricom for exact rates for your business.

---

## Next Steps

1. ✅ Read this guide completely
2. ✅ Contact Safaricom to get production credentials
3. ✅ Set up a public callback URL
4. ✅ Update your .env file
5. ✅ Test with small amounts
6. ✅ Go live!

---

## Need Help?

If you need assistance:
1. Check Safaricom Daraja documentation
2. Contact Safaricom support
3. Review server logs for errors
4. Test callback URL accessibility

---

**Remember**: Always test with small amounts first before accepting large donations!
