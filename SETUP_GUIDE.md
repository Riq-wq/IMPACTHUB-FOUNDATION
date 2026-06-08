# 🚀 ImpactHub M-Pesa Integration Setup Guide

## 📋 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env` and fill in your credentials:

```env
# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
NOTIFICATION_EMAIL=admin@impacthub.org

# M-Pesa Configuration
MPESA_CONSUMER_KEY=your-consumer-key
MPESA_CONSUMER_SECRET=your-consumer-secret
MPESA_BUSINESS_SHORTCODE=174379
MPESA_PASSKEY=your-passkey
MPESA_CALLBACK_URL=https://yourdomain.com/api/mpesa/callback

# Server Configuration
PORT=3000
NODE_ENV=development
```

### 3. Start the Server
```bash
npm start
```

### 4. Test the Integration
```bash
node test-mpesa.js
```

## 🔧 Detailed Setup

### M-Pesa Daraja API Setup

1. **Create Safaricom Developer Account**
   - Visit [developer.safaricom.co.ke](https://developer.safaricom.co.ke)
   - Register for a new account
   - Verify your email and phone number

2. **Create a New App**
   - Go to "My Apps" → "Add a new app"
   - Choose "Lipa Na M-Pesa Online"
   - Fill in app details

3. **Get Credentials**
   - **Consumer Key**: Found in app details
   - **Consumer Secret**: Found in app details  
   - **Business Shortcode**: Use `174379` for sandbox
   - **Passkey**: Get from Lipa Na M-Pesa Online section

4. **Configure Callback URL**
   - For development: Use ngrok or similar tunneling service
   - For production: Use your HTTPS domain
   - Format: `https://yourdomain.com/api/mpesa/callback`

### Email Setup (Gmail)

1. **Enable 2-Factor Authentication**
   - Go to Google Account settings
   - Enable 2FA for your account

2. **Generate App Password**
   - Go to Google Account → Security → App passwords
   - Generate password for "Mail"
   - Use this password in `EMAIL_PASS`

### Production Deployment

1. **Environment Variables**
   ```env
   NODE_ENV=production
   MPESA_CALLBACK_URL=https://yourdomain.com/api/mpesa/callback
   ```

2. **HTTPS Certificate**
   - M-Pesa requires HTTPS for callbacks
   - Use Let's Encrypt or similar SSL provider

3. **Database Migration**
   - For production, consider migrating from JSON to PostgreSQL/MongoDB
   - Update `database.js` accordingly

## 🧪 Testing

### Automated Tests
```bash
# Run all tests
node test-mpesa.js

# Test specific components
node -e "require('./test-mpesa').testHealthCheck()"
```

### Manual Testing

1. **Health Check**
   ```bash
   curl http://localhost:3000/api/health
   ```

2. **M-Pesa Payment**
   - Use sandbox phone numbers: `254708374149`, `254711082300`
   - Test amounts: Any amount (simulated in sandbox)

3. **Admin Dashboard**
   ```bash
   curl http://localhost:3000/api/admin/transactions
   ```

## 📱 Supported Features

### ✅ Implemented
- **Real M-Pesa STK Push** - Sends payment prompts to user phones
- **Automatic Email Receipts** - Thank you emails with transaction details
- **Transaction Database** - JSON-based storage with cleanup
- **Status Tracking** - Real-time payment status monitoring
- **Error Handling** - Comprehensive error management with retries
- **Admin Endpoints** - Transaction monitoring and management
- **Input Validation** - Phone number, email, and amount validation
- **Callback Security** - Secure M-Pesa callback processing

### 🔄 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/mpesa/stkpush` | POST | Initiate M-Pesa payment |
| `/api/mpesa/callback` | POST | M-Pesa callback (automatic) |
| `/api/mpesa/status/:id` | GET | Check payment status |
| `/api/admin/transactions` | GET | View recent transactions |
| `/api/admin/cleanup` | POST | Cleanup old transactions |
| `/api/health` | GET | System health check |

## 🔒 Security Considerations

### Production Checklist
- [ ] Use HTTPS for all endpoints
- [ ] Secure environment variables
- [ ] Add authentication to admin endpoints
- [ ] Implement rate limiting
- [ ] Add request logging
- [ ] Validate callback signatures (if available)
- [ ] Use proper database with encryption

### Phone Number Validation
- Accepts formats: `254XXXXXXXXX`, `07XXXXXXXX`, `+254XXXXXXXXX`
- Validates Safaricom prefixes (07XX, 01XX)
- Automatically formats to M-Pesa standard

### Amount Validation
- Minimum: KSH 1
- Maximum: KSH 150,000
- Automatically rounds to whole numbers

## 🐛 Troubleshooting

### Common Issues

**1. "Missing M-Pesa credentials"**
- Check `.env` file exists and has correct variable names
- Verify credentials from Safaricom Developer Portal

**2. "Invalid phone number format"**
- Use Safaricom numbers (07XX or 01XX)
- Check phone number length (9-12 digits)

**3. "Payment request failed"**
- Verify M-Pesa credentials are correct
- Check if using sandbox vs production URLs
- Ensure callback URL is accessible

**4. "Callback not received"**
- Verify callback URL is HTTPS in production
- Check server logs for incoming requests
- Test callback URL accessibility

**5. "Email not sent"**
- Verify Gmail app password is correct
- Check if 2FA is enabled on Gmail account
- Review email service configuration

### Debug Mode
```bash
# Enable detailed logging
DEBUG=* npm start

# Check specific transaction
curl http://localhost:3000/api/mpesa/status/CHECKOUT_REQUEST_ID
```

## 📊 Monitoring

### Transaction Logs
- All transactions stored in `data/transactions.json`
- Automatic cleanup of old transactions (30+ days)
- Admin endpoint for recent transactions

### Health Monitoring
```bash
# Check system health
curl http://localhost:3000/api/health

# Response includes:
# - Server status
# - M-Pesa configuration status
# - Email configuration status
# - Environment information
```

## 🚀 Going Live

### Pre-Launch Checklist
1. [ ] Test with real Safaricom numbers in sandbox
2. [ ] Verify email notifications work
3. [ ] Test callback URL accessibility
4. [ ] Set up production M-Pesa credentials
5. [ ] Configure HTTPS certificate
6. [ ] Set up monitoring and logging
7. [ ] Test with small real money amounts
8. [ ] Train staff on admin endpoints

### Production Environment Variables
```env
NODE_ENV=production
MPESA_CONSUMER_KEY=prod-consumer-key
MPESA_CONSUMER_SECRET=prod-consumer-secret
MPESA_BUSINESS_SHORTCODE=your-prod-shortcode
MPESA_PASSKEY=prod-passkey
MPESA_CALLBACK_URL=https://yourdomain.com/api/mpesa/callback
```

## 📞 Support

### Safaricom Support
- Developer Portal: [developer.safaricom.co.ke](https://developer.safaricom.co.ke)
- Documentation: [developer.safaricom.co.ke/docs](https://developer.safaricom.co.ke/docs)
- Support Email: apisupport@safaricom.co.ke

### Integration Support
- Check server logs for detailed error messages
- Use test script: `node test-mpesa.js`
- Review transaction database: `data/transactions.json`

---

🎉 **Your M-Pesa integration is now ready for production!**
