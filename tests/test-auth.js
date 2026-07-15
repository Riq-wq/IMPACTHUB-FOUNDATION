const axios = require('axios');
require('dotenv').config();

// Test credentials from environment
const CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY;
const CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET;
const AUTH_URL = 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';

async function testAuth() {
    try {
        console.log('Testing M-Pesa authentication...');
        const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');
        
        const response = await axios.get(AUTH_URL, {
            headers: {
                'Authorization': `Basic ${auth}`
            },
            timeout: 10000
        });
        
        console.log('Authentication successful!');
        console.log('Access Token:', response.data.access_token);
        return true;
    } catch (error) {
        console.error('Authentication failed:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });
        return false;
    }
}

testAuth().then(success => {
    if (!success) {
        console.log('\nPlease get new credentials from the Safaricom Developer Portal:');
        console.log('1. Go to https://developer.safaricom.co.ke/');
        console.log('2. Log in to your account');
        console.log('3. Navigate to "My Apps"');
        console.log('4. Create a new app or use an existing one');
        console.log('5. Update your .env file with the new credentials');
    }
});
