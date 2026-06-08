const axios = require('axios');
require('dotenv').config();

async function testCredentials() {
    try {
        const CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY;
        const CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET;
        
        if (!CONSUMER_KEY || !CONSUMER_SECRET) {
            console.error('Error: M-Pesa credentials not found in .env file');
            return false;
        }

        console.log('Testing M-Pesa credentials...');
        console.log('Consumer Key:', CONSUMER_KEY ? '***' + CONSUMER_KEY.slice(-4) : 'Not set');
        
        const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');
        
        const response = await axios.get('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
            headers: {
                'Authorization': `Basic ${auth}`
            },
            timeout: 10000
        });
        
        console.log('✅ Authentication successful!');
        console.log('Access Token:', response.data.access_token ? 'Received' : 'Not received');
        return true;
        
    } catch (error) {
        console.error('❌ Authentication failed:', {
            status: error.response?.status,
            statusText: error.response?.statusText,
            error: error.response?.data || error.message
        });
        
        if (error.response?.data?.errorMessage) {
            console.error('Error Message:', error.response.data.errorMessage);
            if (error.response.data.errorMessage.includes('Invalid consumer key or secret')) {
                console.error('\n⚠️  Your M-Pesa credentials are invalid or have expired.');
                console.error('Please get new credentials from the Safaricom Developer Portal:');
                console.error('1. Go to https://developer.safaricom.co.ke/');
                console.error('2. Log in to your account');
                console.error('3. Navigate to "My Apps"');
                console.error('4. Create a new app or use an existing one');
                console.error('5. Update your .env file with the new credentials');
            }
        }
        
        return false;
    }
}

testCredentials().then(success => {
    if (!success) {
        process.exit(1);
    }
});
