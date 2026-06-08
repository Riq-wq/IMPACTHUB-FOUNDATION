require('dotenv').config();
const axios = require('axios');

async function testSTKPush() {
    try {
        console.log('\n=== Direct STK Push Test ===\n');
        
        const consumerKey = process.env.MPESA_CONSUMER_KEY;
        const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
        const businessShortCode = process.env.MPESA_BUSINESS_SHORTCODE || '174379';
        const passkey = process.env.MPESA_PASSKEY;
        const callbackUrl = process.env.MPESA_CALLBACK_URL || 'https://mydomain.com/pat';
        
        // Step 1: Get Access Token
        console.log('Step 1: Getting access token...');
        const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
        
        const authResponse = await axios.get(
            'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
            {
                headers: {
                    'Authorization': `Basic ${auth}`
                }
            }
        );
        
        const accessToken = authResponse.data.access_token;
        console.log('✅ Access Token:', accessToken.substring(0, 30) + '...');
        
        // Step 2: Generate Password
        console.log('\nStep 2: Generating password...');
        const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
        const password = Buffer.from(`${businessShortCode}${passkey}${timestamp}`).toString('base64');
        console.log('✅ Timestamp:', timestamp);
        console.log('✅ Password generated');
        
        // Step 3: Prepare STK Push Data
        console.log('\nStep 3: Preparing STK Push request...');
        const phoneNumber = '254708374149'; // Test number
        const amount = 1;
        
        const stkPushData = {
            BusinessShortCode: businessShortCode,
            Password: password,
            Timestamp: timestamp,
            TransactionType: 'CustomerPayBillOnline',
            Amount: amount,
            PartyA: phoneNumber,
            PartyB: businessShortCode,
            PhoneNumber: phoneNumber,
            CallBackURL: callbackUrl,
            AccountReference: 'Test123',
            TransactionDesc: 'Test Payment'
        };
        
        console.log('Request Data:', JSON.stringify({
            ...stkPushData,
            Password: '***'
        }, null, 2));
        
        // Step 4: Send STK Push
        console.log('\nStep 4: Sending STK Push request...');
        const stkResponse = await axios.post(
            'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
            stkPushData,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('\n✅ SUCCESS!');
        console.log('Response:', JSON.stringify(stkResponse.data, null, 2));
        
        if (stkResponse.data.CheckoutRequestID) {
            console.log('\n🎉 STK Push sent successfully!');
            console.log('CheckoutRequestID:', stkResponse.data.CheckoutRequestID);
            console.log('MerchantRequestID:', stkResponse.data.MerchantRequestID);
        }
        
    } catch (error) {
        console.error('\n❌ ERROR!');
        
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Response:', JSON.stringify(error.response.data, null, 2));
            
            if (error.response.data.errorCode === '404.001.03') {
                console.error('\n⚠️  INVALID ACCESS TOKEN ERROR');
                console.error('\nThis error means:');
                console.error('1. Your sandbox credentials might be expired');
                console.error('2. Safaricom sandbox might be having issues');
                console.error('3. You might need to regenerate your credentials');
                console.error('\nSolutions:');
                console.error('1. Go to: https://developer.safaricom.co.ke/');
                console.error('2. Log in to your account');
                console.error('3. Go to your app');
                console.error('4. Click "Generate" to get new credentials');
                console.error('5. Update your .env file');
                console.error('6. Try again');
            }
        } else {
            console.error('Error:', error.message);
        }
    }
}

testSTKPush();
