require('dotenv').config();
const axios = require('axios');

async function testAuth() {
    console.log('\n=== M-Pesa Authentication Test ===\n');
    
    try {
        const consumerKey = process.env.MPESA_CONSUMER_KEY;
        const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
        const businessShortCode = process.env.MPESA_BUSINESS_SHORTCODE;
        const passkey = process.env.MPESA_PASSKEY;
        const callbackUrl = process.env.MPESA_CALLBACK_URL;
        
        console.log('Checking Environment Variables:');
        console.log('✓ Consumer Key:', consumerKey ? `Set (${consumerKey.length} chars)` : '✗ Not Set');
        console.log('✓ Consumer Secret:', consumerSecret ? `Set (${consumerSecret.length} chars)` : '✗ Not Set');
        console.log('✓ Business Shortcode:', businessShortCode || '✗ Not Set');
        console.log('✓ Passkey:', passkey ? `Set (${passkey.length} chars)` : '✗ Not Set');
        console.log('✓ Callback URL:', callbackUrl || '✗ Not Set');
        
        if (!consumerKey || !consumerSecret) {
            console.error('\n❌ ERROR: Consumer Key and Secret are required!');
            console.error('Please set them in your .env file:');
            console.error('MPESA_CONSUMER_KEY=your_key_here');
            console.error('MPESA_CONSUMER_SECRET=your_secret_here');
            return;
        }
        
        console.log('\n--- Testing Authentication ---');
        
        const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
        
        console.log('Sending request to Safaricom Daraja API...');
        
        const response = await axios.get(
            'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
            {
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            }
        );
        
        if (response.data.access_token) {
            console.log('\n✅ SUCCESS! Authentication Successful!\n');
            console.log('Access Token:', response.data.access_token.substring(0, 30) + '...');
            console.log('Expires In:', response.data.expires_in, 'seconds');
            console.log('Token Type:', response.data.token_type);
            
            console.log('\n--- Configuration Summary ---');
            console.log('✓ M-Pesa credentials are valid');
            console.log('✓ API connection is working');
            console.log('✓ You can now test STK Push');
            
            if (callbackUrl === 'https://mydomain.com/pat') {
                console.log('\n⚠️  WARNING: Callback URL is not configured!');
                console.log('You need to set a public callback URL to receive payment confirmations.');
                console.log('Consider using ngrok for local testing:');
                console.log('1. Install ngrok: npm install -g ngrok');
                console.log('2. Run: ngrok http 3001');
                console.log('3. Copy the HTTPS URL and update .env:');
                console.log('   MPESA_CALLBACK_URL=https://your-ngrok-url.ngrok.io/api/mpesa/callback');
            } else {
                console.log('✓ Callback URL is configured');
            }
            
            console.log('\n--- Next Steps ---');
            console.log('1. Start your server: node server.js');
            console.log('2. Open browser: http://localhost:3001');
            console.log('3. Fill the donation form');
            console.log('4. Use test phone: 254708374149');
            console.log('5. Use test amount: 10');
            console.log('6. Check your phone for STK Push prompt');
            console.log('7. Enter PIN: 1234 (sandbox test PIN)');
            
        } else {
            console.error('\n❌ ERROR: No access token received');
            console.error('Response:', response.data);
        }
        
    } catch (error) {
        console.error('\n❌ AUTHENTICATION FAILED!\n');
        
        if (error.response) {
            console.error('Status Code:', error.response.status);
            console.error('Status Text:', error.response.statusText);
            console.error('Error Data:', JSON.stringify(error.response.data, null, 2));
            
            if (error.response.status === 401) {
                console.error('\n⚠️  INVALID CREDENTIALS!');
                console.error('\nPlease check:');
                console.error('1. Consumer Key is correct (no extra spaces)');
                console.error('2. Consumer Secret is correct (no extra spaces)');
                console.error('3. Credentials are from Safaricom Daraja Portal');
                console.error('4. You are using sandbox credentials for sandbox testing');
                console.error('\nGet credentials from: https://developer.safaricom.co.ke/');
            } else if (error.response.status === 400) {
                console.error('\n⚠️  BAD REQUEST!');
                console.error('The request format is incorrect.');
            } else if (error.response.status >= 500) {
                console.error('\n⚠️  SERVER ERROR!');
                console.error('Safaricom Daraja API is experiencing issues.');
                console.error('Please try again later or check Daraja status.');
            }
        } else if (error.request) {
            console.error('No response received from M-Pesa API');
            console.error('\n⚠️  CONNECTION ERROR!');
            console.error('\nPossible causes:');
            console.error('1. No internet connection');
            console.error('2. Firewall blocking the request');
            console.error('3. Safaricom Daraja API is down');
            console.error('4. DNS resolution issues');
            console.error('\nPlease check your internet connection and try again.');
        } else {
            console.error('Error:', error.message);
        }
        
        console.error('\n--- Troubleshooting ---');
        console.error('1. Verify your .env file has correct credentials');
        console.error('2. Check https://developer.safaricom.co.ke/ for API status');
        console.error('3. Ensure you have internet connection');
        console.error('4. Try regenerating your credentials on Daraja Portal');
        console.error('5. Read TROUBLESHOOTING.md for more help');
    }
    
    console.log('\n=== Test Complete ===\n');
}

// Run the test
testAuth();
