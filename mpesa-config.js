// M-Pesa Daraja API Configuration
const axios = require('axios');
const RetryHandler = require('./retry-handler');
require('dotenv').config();

class MpesaAPI {
    constructor() {
        // Daraja API Credentials from environment variables
        this.consumerKey = process.env.MPESA_CONSUMER_KEY || '';
        this.consumerSecret = process.env.MPESA_CONSUMER_SECRET || '';
        this.businessShortCode = process.env.MPESA_BUSINESS_SHORTCODE || '174379'; // Default to sandbox
        this.passkey = process.env.MPESA_PASSKEY || '';
        
        // Determine environment - Production or Sandbox
        this.isProduction = process.env.NODE_ENV === 'production' && 
                           this.businessShortCode !== '174379'; // 174379 is sandbox shortcode
        
        // Set base URL based on environment
        this.baseUrl = this.isProduction 
            ? 'https://api.safaricom.co.ke'  // Production URL
            : 'https://sandbox.safaricom.co.ke'; // Sandbox URL
        
        // Callback URL - use ngrok or a public URL for testing
        // For local testing, you can use a service like ngrok to expose your local server
        this.callbackUrl = process.env.MPESA_CALLBACK_URL || 'https://mydomain.com/pat';
        
        // Display environment information
        if (this.isProduction) {
            console.log('🚀 M-Pesa PRODUCTION Mode Activated');
            console.log('💰 Real money will be transferred!');
            console.log('Business ShortCode:', this.businessShortCode);
            console.log('M-Pesa Callback URL:', this.callbackUrl);
            
            // Warn if callback URL is not set properly
            if (this.callbackUrl === 'https://mydomain.com/pat') {
                console.error('❌ ERROR: Production callback URL not configured!');
                console.error('❌ Set MPESA_CALLBACK_URL in your .env file');
                console.error('❌ Payments will NOT work without a valid callback URL');
            }
        } else {
            console.log('🧪 M-Pesa Sandbox Mode Activated (Testing Only)');
            console.log('⚠️  No real money will be transferred');
            console.log('Business ShortCode:', this.businessShortCode);
            console.log('M-Pesa Callback URL:', this.callbackUrl);
            
            // Warn if using default callback URL
            if (this.callbackUrl === 'https://mydomain.com/pat') {
                console.warn('⚠️  WARNING: Using default callback URL. M-Pesa callbacks will not work!');
                console.warn('⚠️  To receive callbacks, set MPESA_CALLBACK_URL to a public URL (e.g., using ngrok)');
                console.warn('⚠️  Example: MPESA_CALLBACK_URL=https://your-ngrok-url.ngrok.io/api/mpesa/callback');
            }
        }
        
        this.accessToken = null;
        this.tokenExpiry = null;
        
        // Initialize retry handler
        this.retryHandler = new RetryHandler({
            maxRetries: 2,
            baseDelay: 2000,
            maxDelay: 8000
        });
    }

    // Generate access token
    async getAccessToken(forceRefresh = false) {
        // Force refresh if requested or if token is expired/missing
        if (forceRefresh || !this.accessToken || !this.tokenExpiry || Date.now() >= this.tokenExpiry) {
            try {
                console.log('Generating new M-Pesa access token...');
                console.log('Using consumer key:', this.consumerKey ? '****' + this.consumerKey.slice(-4) : 'Not set');
                
                const auth = Buffer.from(`${this.consumerKey}:${this.consumerSecret}`).toString('base64');
                console.log('Auth header created');
                
                const response = await axios.get(`${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
                    headers: {
                        'Authorization': `Basic ${auth}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 10000 // 10 second timeout
                });

                if (!response.data.access_token) {
                    console.error('No access token in response:', response.data);
                    throw new Error('No access token received from M-Pesa API');
                }

                this.accessToken = response.data.access_token;
                // Set expiry with 2 minute buffer to be safe
                this.tokenExpiry = Date.now() + ((response.data.expires_in - 120) * 1000);
                
                console.log('Successfully generated access token');
                console.log('Token expires in:', response.data.expires_in, 'seconds');
                return this.accessToken;
            } catch (error) {
                console.error('Error getting access token:', {
                    message: error.message,
                    status: error.response?.status,
                    statusText: error.response?.statusText,
                    data: error.response?.data
                });
                
                // Clear cached token on error
                this.accessToken = null;
                this.tokenExpiry = null;
                
                throw new Error(`Failed to get M-Pesa access token: ${error.message}`);
            }
        }
        
        console.log('Using cached access token');
        return this.accessToken;
    }

    // Format phone number to required 2547XXXXXXXX format
    formatPhoneNumber(phone) {
        // Remove any non-digits
        let cleanPhone = phone.replace(/\D/g, '');
        
        // Convert to 254 format if it starts with 0 or doesn't start with 254
        if (cleanPhone.startsWith('0')) {
            cleanPhone = '254' + cleanPhone.substring(1);
        } else if (!cleanPhone.startsWith('254')) {
            cleanPhone = '254' + cleanPhone;
        }
        
        return cleanPhone;
    }

    // Generate password for STK Push
    generatePassword() {
        const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
        const password = Buffer.from(`${this.businessShortCode}${this.passkey}${timestamp}`).toString('base64');
        return { password, timestamp };
    }

    // Validate M-Pesa credentials
    validateCredentials() {
        if (!this.consumerKey || !this.consumerSecret) {
            throw new Error('M-Pesa consumer key and secret are required');
        }
        
        if (!this.businessShortCode || !this.passkey) {
            throw new Error('M-Pesa business shortcode and passkey are required');
        }
    }

    // Validate transaction parameters
    validateTransactionParams(phoneNumber, amount, accountReference, transactionDesc) {
        if (!phoneNumber) {
            throw new Error('Phone number is required');
        }
        
        if (!amount || isNaN(amount) || amount <= 0) {
            throw new Error('Amount must be a positive number');
        }
        
        if (!accountReference || accountReference.length > 12) {
            throw new Error('Account reference is required and must be 12 characters or less');
        }
        
        if (!transactionDesc || transactionDesc.length > 13) {
            throw new Error('Transaction description is required and must be 13 characters or less');
        }
    }

    // Initiate STK Push (sends payment prompt to user's phone)
    async initiateSTKPush(phoneNumber, amount, accountReference, transactionDesc, retryCount = 0) {
        try {
            console.log('=== STK Push Initiation Started ===');
            if (retryCount > 0) {
                console.log(`Retry attempt: ${retryCount}`);
            }
            
            console.log('Environment Variables:', {
                businessShortCode: this.businessShortCode,
                callbackUrl: this.callbackUrl,
                baseUrl: this.baseUrl,
                passkey: this.passkey ? '***' + this.passkey.slice(-4) : 'Not set'
            });
            
            // Validate credentials and parameters
            this.validateCredentials();
            this.validateTransactionParams(phoneNumber, amount, accountReference, transactionDesc);
            
            // Format phone number
            const formattedPhone = this.formatPhoneNumber(phoneNumber);
            console.log('Formatted Phone:', formattedPhone);
            
            // Generate password and timestamp
            const { password, timestamp } = this.generatePassword();
            console.log('Generated Timestamp:', timestamp);
            
            // Get access token (force refresh on retry)
            const accessToken = await this.getAccessToken(retryCount > 0);
            console.log('Access Token:', accessToken ? 'Retrieved' : 'Failed to retrieve');

            // Prepare STK push data
            const stkPushData = {
                BusinessShortCode: this.businessShortCode,
                Password: password,
                Timestamp: timestamp,
                TransactionType: 'CustomerPayBillOnline',
                Amount: Math.floor(amount), // Must be a whole number
                PartyA: formattedPhone,
                PartyB: this.businessShortCode,
                PhoneNumber: formattedPhone,
                CallBackURL: this.callbackUrl,
                AccountReference: accountReference.substring(0, 12),
                TransactionDesc: transactionDesc.substring(0, 13)
            };
            
            // Log the request data (without sensitive information)
            console.log('STK Push Request Data (sanitized):', JSON.stringify({
                ...stkPushData,
                Password: '***' // Don't log the full password
            }, null, 2));

            console.log('Initiating STK Push with:', {
                phone: formattedPhone,
                amount: stkPushData.Amount,
                reference: stkPushData.AccountReference,
                businessShortCode: this.businessShortCode
            });

            console.log('Sending STK Push request to:', `${this.baseUrl}/mpesa/stkpush/v1/processrequest`);
            
            const response = await axios.post(
                `${this.baseUrl}/mpesa/stkpush/v1/processrequest`,
                stkPushData,
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                        'Cache-Control': 'no-cache'
                    },
                    timeout: 30000, // 30 seconds timeout
                    validateStatus: function(status) {
                        return status < 500; // Resolve for all status codes less than 500
                    }
                }
            );

            console.log('STK Push Response Status:', response.status);
            console.log('STK Push Response Data:', JSON.stringify(response.data, null, 2));

            // Check for invalid token error and retry
            if (response.data.errorCode === '400002' || 
                (response.data.errorMessage && response.data.errorMessage.toLowerCase().includes('invalid access token'))) {
                
                if (retryCount < 1) {
                    console.log('Invalid access token detected, retrying with fresh token...');
                    // Clear the cached token
                    this.accessToken = null;
                    this.tokenExpiry = null;
                    // Retry with fresh token
                    return await this.initiateSTKPush(phoneNumber, amount, accountReference, transactionDesc, retryCount + 1);
                } else {
                    throw new Error('Invalid Access Token - Please check your M-Pesa credentials');
                }
            }

            // Check for other errors in response
            if (response.data.errorCode || (response.data.ResultCode && response.data.ResultCode !== '0')) {
                const errorMessage = response.data.errorMessage || response.data.ResultDesc || 'Unknown error from M-Pesa';
                console.error('M-Pesa API Error:', {
                    status: response.status,
                    errorCode: response.data.errorCode,
                    errorMessage: errorMessage,
                    requestId: response.data.requestId,
                    responseData: response.data
                });
                throw new Error(`M-Pesa API Error: ${errorMessage}`);
            }

            if (!response.data.CheckoutRequestID) {
                throw new Error('Invalid response from M-Pesa: Missing CheckoutRequestID');
            }

            return {
                success: true,
                checkoutRequestId: response.data.CheckoutRequestID,
                merchantRequestId: response.data.MerchantRequestID,
                responseCode: response.data.ResponseCode,
                responseDescription: response.data.ResponseDescription,
                customerMessage: response.data.CustomerMessage
            };

        } catch (error) {
            console.error('=== STK Push Error Details ===');
            console.error('Error Message:', error.message);
            
            if (error.response) {
                console.error('Response Status:', error.response.status);
                console.error('Response Headers:', JSON.stringify(error.response.headers, null, 2));
                console.error('Response Data:', JSON.stringify(error.response.data, null, 2));
                
                if (error.response.data) {
                    const mpesaError = error.response.data;
                    console.error('M-Pesa Error Code:', mpesaError.errorCode || 'N/A');
                    console.error('M-Pesa Error Message:', mpesaError.errorMessage || mpesaError.ResultDesc || 'No error message');
                    
                    if (mpesaError.requestId) {
                        console.error('M-Pesa Request ID:', mpesaError.requestId);
                    }
                    
                    if (mpesaError.ResultCode) {
                        console.error('M-Pesa Result Code:', mpesaError.ResultCode);
                    }
                }
            } else if (error.request) {
                console.error('No response received from M-Pesa API');
                console.error('Request:', error.request);
            } else {
                console.error('Error setting up request:', error.message);
            }
            
            console.error('Error Config:', {
                url: error.config?.url,
                method: error.config?.method,
                headers: error.config?.headers ? '***' : 'No headers',
                data: error.config?.data ? '***' : 'No data'
            });
            
            console.error('Stack Trace:', error.stack);
            console.error('=== End of Error Details ===');
            
            throw new Error(`Failed to initiate STK Push: ${error.message}`);
        }
    }

    // Query STK Push status
    async querySTKPushStatus(checkoutRequestId) {
        try {
            const accessToken = await this.getAccessToken();
            const { password, timestamp } = this.generatePassword();
            
            const queryData = {
                BusinessShortCode: this.businessShortCode,
                Password: password,
                Timestamp: timestamp,
                CheckoutRequestID: checkoutRequestId
            };
            
            console.log('Querying STK Push status for:', checkoutRequestId);
            
            const response = await axios.post(
                `${this.baseUrl}/mpesa/stkpushquery/v1/query`,
                queryData,
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 10000
                }
            );

            console.log('STK Query Response:', JSON.stringify(response.data, null, 2));
            
            // Check the result code
            // ResultCode "0" = Success
            // ResultCode "1032" = Cancelled by user
            // ResultCode "1" = Insufficient funds
            // ResultCode "2001" = Wrong PIN
            
            if (response.data.ResultCode) {
                const resultCode = response.data.ResultCode;
                const resultDesc = response.data.ResultDesc || '';
                
                if (resultCode === '0') {
                    return { success: true, status: 'completed', resultCode, resultDesc };
                } else if (resultCode === '1032') {
                    return { success: true, status: 'cancelled', resultCode, resultDesc: 'Payment cancelled by user' };
                } else if (resultCode === '1') {
                    return { success: true, status: 'failed', resultCode, resultDesc: 'Insufficient funds' };
                } else if (resultCode === '2001') {
                    return { success: true, status: 'failed', resultCode, resultDesc: 'Wrong PIN entered' };
                } else {
                    return { success: true, status: 'failed', resultCode, resultDesc };
                }
            }
            
            // If no ResultCode yet, payment is still pending
            return { success: true, status: 'pending', resultCode: response.data.ResultCode };
            
        } catch (error) {
            console.error('Error querying STK Push status:', error.response?.data || error.message);
            
            // Return pending status but with success=false to indicate query failed
            return { success: false, status: 'pending', error: error.message };
        }
    }
}

module.exports = MpesaAPI;
