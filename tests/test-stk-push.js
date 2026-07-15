const axios = require('axios');
require('dotenv').config();

const PORT = process.env.PORT || 3001;
const BASE_URL = `http://localhost:${PORT}`;

async function testSTKPush() {
    try {
        const testPhone = process.argv[2] || '254795853435';
        console.log('Testing STK Push with phone:', testPhone);
        
        const requestData = {
            fullName: 'Test User',
            email: 'test@example.com',
            phone: testPhone,
            amount: 1,
            cause: 'test'
        };
        
        console.log('Sending request to:', `${BASE_URL}/api/mpesa/stkpush`);
        console.log('Request data:', JSON.stringify(requestData, null, 2));
        
        const response = await axios({
            method: 'post',
            url: `${BASE_URL}/api/mpesa/stkpush`,
            data: requestData,
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log('\n✅ STK Push Response:');
        console.log('Status:', response.status);
        console.log('Data:', JSON.stringify(response.data, null, 2));
        
        if (response.data.success) {
            console.log('\n✅ STK Push initiated successfully');
            console.log('Checkout Request ID:', response.data.checkoutRequestId);
            console.log('Customer Message:', response.data.customerMessage);
            
            // Check status after 5 seconds
            if (response.data.checkoutRequestId) {
                setTimeout(async () => {
                    try {
                        console.log('\nChecking payment status...');
                        const statusRes = await axios.get(`${BASE_URL}/api/mpesa/status/${response.data.checkoutRequestId}`);
                        console.log('Payment Status:', JSON.stringify(statusRes.data, null, 2));
                    } catch (error) {
                        console.error('\n❌ Error checking status:');
                        console.error(error.response?.data || error.message);
                    }
                }, 5000);
            }
        }
    } catch (error) {
        console.error('\n❌ STK Push Error:');
        
        if (error.response) {
            // Server responded with a status other than 2xx
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
            console.error('Headers:', error.response.headers);
        } else if (error.request) {
            // Request was made but no response received
            console.error('No response received from server');
            console.error('Request:', error.request);
        } else {
            // Something else happened
            console.error('Error:', error.message);
        }
        
        console.error('\nError details:', error);
    }
}

testSTKPush();
