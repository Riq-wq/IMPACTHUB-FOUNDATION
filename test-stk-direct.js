const axios = require('axios');
require('dotenv').config();

// M-Pesa Sandbox Credentials from environment
const CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY;
const CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET;
const BUSINESS_SHORTCODE = process.env.MPESA_BUSINESS_SHORTCODE || '174379';
const PASSKEY = process.env.MPESA_PASSKEY;
const CALLBACK_URL = process.env.MPESA_CALLBACK_URL || 'https://mydomain.com/pat';
const BASE_URL = 'https://sandbox.safaricom.co.ke';

// Test data
const TEST_PHONE = '254795853435'; // Your phone number
const AMOUNT = 1; // KES 1 for testing

// Generate access token
async function getAccessToken() {
    try {
        const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');
        const response = await axios.get(
            `${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`,
            {
                headers: {
                    'Authorization': `Basic ${auth}`
                },
                timeout: 10000
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
        const accessToken = await getAccessToken();
        const { password, timestamp } = generatePassword();
        const formattedPhone = formatPhoneNumber(TEST_PHONE);
        const accountReference = 'TEST' + Date.now().toString().slice(-6);
        
        const stkPushData = {
            BusinessShortCode: BUSINESS_SHORTCODE,
            Password: password,
            Timestamp: timestamp,
            TransactionType: 'CustomerPayBillOnline',
            Amount: AMOUNT,
            PartyA: formattedPhone,
            PartyB: BUSINESS_SHORTCODE,
            PhoneNumber: formattedPhone,
            CallBackURL: CALLBACK_URL,
            AccountReference: accountReference,
            TransactionDesc: 'Test Payment'
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
            status: error.response?.status,
            stack: error.stack
        });
        throw error;
    }
}

// Run the test
console.log('Starting M-Pesa STK Push Test...');
console.log('Using phone number:', TEST_PHONE);
console.log('Amount:', AMOUNT, 'KES');

initiateSTKPush()
    .then(() => console.log('Test completed'))
    .catch(err => console.error('Test failed:', err.message));
