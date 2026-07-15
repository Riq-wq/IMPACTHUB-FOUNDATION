# M-Pesa Integration Setup Guide

## 🚀 Real M-Pesa Payment Integration

Your website now supports **real M-Pesa payments**! Users will receive actual payment prompts on their phones.

## 📋 Setup Requirements

### 1. Get M-Pesa Daraja API Credentials

Visit [Safaricom Developer Portal](https://developer.safaricom.co.ke/):

1. **Create Account** - Register with Safaricom Developer Portal
2. **Create App** - Create a new application
3. **Get Credentials**:
   - Consumer Key
   - Consumer Secret
   - Business Shortcode (use `174379` for sandbox testing)
   - Passkey (Lipa Na M-Pesa Online Passkey)

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

```env
# M-Pesa Daraja API Configuration
MPESA_CONSUMER_KEY=your-actual-consumer-key
MPESA_CONSUMER_SECRET=your-actual-consumer-secret
MPESA_BUSINESS_SHORTCODE=174379
MPESA_PASSKEY=your-actual-passkey
MPESA_CALLBACK_URL=https://yourdomain.com/api/mpesa/callback

# Set to production when ready
NODE_ENV=development
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Start the Server

```bash
npm start
```

## 🎯 How It Works Now

### User Experience:
1. **Fill Form** → Name, email, phone number, amount
2. **Click "Donate via M-Pesa"** → Opens payment modal
3. **Click "Confirm Payment"** → Sends STK Push to their phone
4. **User Enters PIN** → On their actual phone (not website)
5. **Payment Processed** → Automatic email confirmation sent

### Technical Flow:
1. **STK Push Request** → Sends payment prompt to user's phone
2. **User Confirmation** → User enters PIN on their phone
3. **Callback Processing** → M-Pesa sends result to your server
4. **Email Notification** → Automatic thank you email sent
5. **Status Updates** → Real-time payment status tracking

## 🧪 Testing

### Sandbox Testing:
- Use Safaricom test phone numbers
- Test amounts: Any amount (will be simulated)
- Test shortcode: `174379`

### Production Testing:
- Use real phone numbers
- Real money transactions
- Production shortcode from Safaricom

## 🔧 API Endpoints

### `/api/mpesa/stkpush` (POST)
Initiates M-Pesa payment request
```json
{
  "fullName": "John Doe",
  "email": "john@example.com", 
  "phone": "254712345678",
  "amount": 1000,
  "cause": "healthcare"
}
```

### `/api/mpesa/callback` (POST)
Receives M-Pesa payment results (automatic)

### `/api/mpesa/status/:checkoutRequestId` (GET)
Check payment status

## 🔒 Security Notes

- **Never expose** your Consumer Secret in frontend code
- **Use HTTPS** for production callback URLs
- **Validate** all incoming callback data
- **Store credentials** securely in environment variables

## 🌍 Production Deployment

1. **Get Production Credentials** from Safaricom
2. **Set up HTTPS domain** for callback URL
3. **Update environment variables**:
   ```env
   NODE_ENV=production
   MPESA_CALLBACK_URL=https://yourdomain.com/api/mpesa/callback
   ```
4. **Test thoroughly** with small amounts first

## 📱 Supported Phone Numbers

- **Safaricom**: All M-Pesa enabled numbers
- **Format**: `254712345678` or `0712345678`
- **Networks**: Safaricom M-Pesa only

## 🎉 Features

✅ **Real M-Pesa Integration** - Actual payment prompts  
✅ **Automatic Email Receipts** - Thank you emails with transaction details  
✅ **Real-time Status Tracking** - Live payment status updates  
✅ **Secure Callback Handling** - Proper M-Pesa result processing  
✅ **Error Handling** - Comprehensive error management  
✅ **Production Ready** - Scalable architecture  

## 🆘 Troubleshooting

**Payment not received?**
- Check phone number format
- Verify M-Pesa balance
- Check network connectivity

**Callback not working?**
- Ensure HTTPS callback URL
- Check server logs
- Verify credentials

**API errors?**
- Check environment variables
- Verify Daraja API credentials
- Check sandbox vs production settings

---

Your M-Pesa integration is now **production-ready**! 🚀
