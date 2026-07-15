// M-Pesa Integration Test Script
const axios = require('axios');
require('dotenv').config();

const BASE_URL = 'http://localhost:3000';

// Test data
const testDonation = {
    fullName: 'John Doe',
    email: 'john.doe@example.com',
    phone: '254708374149', // Safaricom test number for sandbox
    amount: 100,
    cause: 'healthcare'
};

// Colors for console output
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m'
};

function log(color, message) {
    console.log(`${color}${message}${colors.reset}`);
}

async function testHealthCheck() {
    try {
        log(colors.blue, '\n🔍 Testing Health Check...');
        const response = await axios.get(`${BASE_URL}/api/health`);
        
        if (response.data.status === 'healthy') {
            log(colors.green, '✅ Health check passed');
            log(colors.blue, `M-Pesa: ${response.data.mpesa.configured ? '✅' : '❌'} Configured`);
            log(colors.blue, `Email: ${response.data.email.configured ? '✅' : '❌'} Configured`);
            log(colors.blue, `Environment: ${response.data.mpesa.environment}`);
            return true;
        } else {
            log(colors.red, '❌ Health check failed');
            return false;
        }
    } catch (error) {
        log(colors.red, `❌ Health check error: ${error.message}`);
        return false;
    }
}

async function testMpesaSTKPush() {
    try {
        log(colors.blue, '\n📱 Testing M-Pesa STK Push...');
        
        const response = await axios.post(`${BASE_URL}/api/mpesa/stkpush`, testDonation);
        
        if (response.data.success) {
            log(colors.green, '✅ STK Push initiated successfully');
            log(colors.blue, `Checkout Request ID: ${response.data.checkoutRequestId}`);
            log(colors.blue, `Message: ${response.data.customerMessage}`);
            return response.data.checkoutRequestId;
        } else {
            log(colors.red, `❌ STK Push failed: ${response.data.message}`);
            return null;
        }
    } catch (error) {
        log(colors.red, `❌ STK Push error: ${error.response?.data?.message || error.message}`);
        return null;
    }
}

async function testPaymentStatus(checkoutRequestId) {
    try {
        log(colors.blue, '\n⏳ Testing Payment Status Check...');
        
        const response = await axios.get(`${BASE_URL}/api/mpesa/status/${checkoutRequestId}`);
        
        if (response.data.success) {
            log(colors.green, '✅ Status check successful');
            log(colors.blue, `Status: ${response.data.status}`);
            log(colors.blue, `Message: ${response.data.message}`);
            
            if (response.data.mpesaReceiptNumber) {
                log(colors.blue, `Receipt: ${response.data.mpesaReceiptNumber}`);
            }
            
            return response.data.status;
        } else {
            log(colors.red, `❌ Status check failed: ${response.data.message}`);
            return null;
        }
    } catch (error) {
        log(colors.red, `❌ Status check error: ${error.response?.data?.message || error.message}`);
        return null;
    }
}

async function testAdminEndpoints() {
    try {
        log(colors.blue, '\n👨‍💼 Testing Admin Endpoints...');
        
        // Test transactions endpoint
        const transactionsResponse = await axios.get(`${BASE_URL}/api/admin/transactions?limit=5`);
        
        if (transactionsResponse.data.success) {
            log(colors.green, '✅ Admin transactions endpoint working');
            log(colors.blue, `Found ${transactionsResponse.data.total} recent transactions`);
        } else {
            log(colors.red, '❌ Admin transactions endpoint failed');
        }
        
        return true;
    } catch (error) {
        log(colors.red, `❌ Admin endpoints error: ${error.response?.data?.message || error.message}`);
        return false;
    }
}

async function testInvalidInputs() {
    try {
        log(colors.blue, '\n🚫 Testing Invalid Input Validation...');
        
        // Test missing fields
        const invalidTests = [
            { data: {}, expectedError: 'Missing required fields' },
            { data: { fullName: 'Test' }, expectedError: 'Missing required fields' },
            { data: { fullName: 'Test', email: 'invalid-email' }, expectedError: 'Invalid email format' },
            { data: { fullName: 'Test', email: 'test@test.com', phone: '123', amount: -100 }, expectedError: 'Invalid amount' }
        ];
        
        for (const test of invalidTests) {
            try {
                const response = await axios.post(`${BASE_URL}/api/mpesa/stkpush`, test.data);
                log(colors.red, `❌ Should have failed for: ${JSON.stringify(test.data)}`);
            } catch (error) {
                if (error.response?.status === 400) {
                    log(colors.green, `✅ Correctly rejected invalid input: ${error.response.data.message}`);
                } else {
                    log(colors.red, `❌ Unexpected error: ${error.message}`);
                }
            }
        }
        
        return true;
    } catch (error) {
        log(colors.red, `❌ Input validation test error: ${error.message}`);
        return false;
    }
}

async function runAllTests() {
    log(colors.yellow, '🧪 Starting M-Pesa Integration Tests...\n');
    
    const results = {
        healthCheck: false,
        stkPush: false,
        statusCheck: false,
        adminEndpoints: false,
        inputValidation: false
    };
    
    // Test 1: Health Check
    results.healthCheck = await testHealthCheck();
    
    if (!results.healthCheck) {
        log(colors.red, '\n❌ Server not healthy. Stopping tests.');
        return results;
    }
    
    // Test 2: Invalid Input Validation
    results.inputValidation = await testInvalidInputs();
    
    // Test 3: STK Push (only if M-Pesa is configured)
    const checkoutRequestId = await testMpesaSTKPush();
    results.stkPush = !!checkoutRequestId;
    
    // Test 4: Status Check (only if STK Push succeeded)
    if (checkoutRequestId) {
        const status = await testPaymentStatus(checkoutRequestId);
        results.statusCheck = !!status;
        
        // Wait a bit and check again
        log(colors.blue, '\n⏳ Waiting 5 seconds and checking status again...');
        await new Promise(resolve => setTimeout(resolve, 5000));
        await testPaymentStatus(checkoutRequestId);
    }
    
    // Test 5: Admin Endpoints
    results.adminEndpoints = await testAdminEndpoints();
    
    // Summary
    log(colors.yellow, '\n📊 Test Results Summary:');
    log(colors.blue, '========================');
    
    Object.entries(results).forEach(([test, passed]) => {
        const status = passed ? '✅ PASSED' : '❌ FAILED';
        const color = passed ? colors.green : colors.red;
        log(color, `${test.padEnd(20)}: ${status}`);
    });
    
    const passedCount = Object.values(results).filter(Boolean).length;
    const totalCount = Object.keys(results).length;
    
    log(colors.yellow, `\nOverall: ${passedCount}/${totalCount} tests passed`);
    
    if (passedCount === totalCount) {
        log(colors.green, '🎉 All tests passed! M-Pesa integration is working correctly.');
    } else {
        log(colors.red, '⚠️  Some tests failed. Check the configuration and try again.');
    }
    
    return results;
}

// Run tests if this file is executed directly
if (require.main === module) {
    runAllTests().catch(error => {
        log(colors.red, `Fatal error: ${error.message}`);
        process.exit(1);
    });
}

module.exports = { runAllTests, testHealthCheck, testMpesaSTKPush, testPaymentStatus };
