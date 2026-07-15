const axios = require('axios');
require('dotenv').config();

// M-Pesa Sandbox Credentials
const CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY;
const CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET;
const BUSINESS_SHORTCODE = process.env.MPESA_BUSINESS_SHORTCODE || '174379';
const PASSKEY = process.env.MPESA_PASSKEY;
// Using a test callback URL that M-Pesa sandbox accepts
const CALLBACK_URL = 'https://mydomain.com/pat';  // Standard test URL from M-Pesa docs
const BASE_URL = 'https://sandbox.safaricom.co.ke';

// Generate access token
async function getAccessToken() {
    try {
        const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');
        const response = await axios.get(
            `${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`,
            {
                headers: {
                    'Authorization': `Basic ${auth}`
                }
            }
        );
        return response.data.access_token;
    } catch (error) {
        console.error('Error getting access token:', error.response?.data || error.message);
        throw error;
    }
}

// Generate password
function generatePassword() {
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
    const password = Buffer.from(`${BUSINESS_SHORTCODE}${PASSKEY}${timestamp}`).toString('base64');
    return { password, timestamp };
}

// Format phone number
function formatPhoneNumber(phone) {
    let cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.startsWith('0')) {
        cleanPhone = '254' + cleanPhone.substring(1);
    } else if (!cleanPhone.startsWith('254')) {
        cleanPhone = '254' + cleanPhone;
    }
    return cleanPhone;
}

// Initiate STK Push
async function initiateSTKPush() {
    try {
        // Using your provided phone number
        const phoneNumber = '254795853435'; // Your phone number
        const amount = 1; // KES 1 for testing
        const accountReference = 'Test' + Math.floor(Math.random() * 1000);
        const transactionDesc = 'Test payment';

        const accessToken = await getAccessToken();
        const { password, timestamp } = generatePassword();
        const formattedPhone = formatPhoneNumber(phoneNumber);

        const stkPushData = {
            BusinessShortCode: BUSINESS_SHORTCODE,
            Password: password,
            Timestamp: timestamp,
            TransactionType: 'CustomerPayBillOnline',
            Amount: Math.floor(amount),
            PartyA: formattedPhone,
            PartyB: BUSINESS_SHORTCODE,
            PhoneNumber: formattedPhone,
            CallBackURL: CALLBACK_URL,
            AccountReference: accountReference.substring(0, 12),
            TransactionDesc: transactionDesc.substring(0, 13)
        };

        console.log('Sending STK Push with data:', JSON.stringify(stkPushData, null, 2));

        const response = await axios.post(
            `${BASE_URL}/mpesa/stkpush/v1/processrequest`,
            stkPushData,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                timeout: 30000
            }
        );

        console.log('STK Push Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('STK Push Error:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });
        throw error;
    }
}

// Run the test
initiateSTKPush()
    .then(() => console.log('Test completed'))
    .catch(err => console.error('Test failed:', err));
