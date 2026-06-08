const IntaSend = require('intasend-node');

class IntaSendAPI {
    constructor() {
        this.publishableKey = process.env.INTASEND_PUBLISHABLE_KEY || '';
        this.secretKey = process.env.INTASEND_SECRET_KEY || '';
        this.isSandbox = process.env.INTASEND_SANDBOX !== 'false';

        const intasend = new IntaSend(
            this.publishableKey,
            this.secretKey,
            this.isSandbox
        );
        this.collection = intasend.collection();

        console.log(`IntaSend Mode: ${this.isSandbox ? 'SANDBOX' : 'PRODUCTION'}`);
        console.log(`IntaSend Keys: ${this.publishableKey ? 'Publishable: OK' : 'Publishable: MISSING'}, ${this.secretKey ? 'Secret: OK' : 'Secret: MISSING'}`);
    }

    async initiateSTKPush(phoneNumber, amount, accountReference, transactionDesc, donorName, donorEmail) {
        try {
            const nameParts = (donorName || 'Donor').split(' ');
            const firstName = nameParts[0] || 'Donor';
            const lastName = nameParts.slice(1).join(' ') || '';

            const payload = {
                first_name: firstName,
                last_name: lastName,
                email: donorEmail || '',
                host: process.env.APP_URL || 'http://localhost:3001',
                amount: Math.floor(amount),
                phone_number: phoneNumber,
                api_ref: accountReference,
                narrative: transactionDesc || 'ImpactHub Donation',
                method: 'M-PESA',
                currency: 'KES'
            };

            console.log('IntaSend STK Push payload:', JSON.stringify({ ...payload, phone_number: '***' + phoneNumber.slice(-4) }, null, 2));

            const resp = await this.collection.mpesaStkPush(payload);

            console.log('IntaSend STK Push response:', JSON.stringify(resp, null, 2));

            if (!resp || !resp.invoice_id) {
                throw new Error(resp ? resp.detail || 'No invoice_id in response' : 'No response from IntaSend');
            }

            return {
                success: true,
                checkoutRequestId: resp.invoice_id,
                merchantRequestId: resp.invoice_id,
                responseCode: '0',
                responseDescription: resp.detail || 'Success',
                customerMessage: 'Check your phone for M-Pesa prompt'
            };

        } catch (error) {
            console.error('IntaSend STK Push error:', {
                message: error.message,
                response: typeof error === 'object' ? JSON.stringify(error) : error
            });

            let userMessage = 'Payment request failed. Please try again.';
            if (error.message && error.message.includes('Invalid')) {
                userMessage = 'Invalid phone number. Please check and try again.';
            } else if (error.message && error.message.includes('insufficient')) {
                userMessage = 'Insufficient funds. Please check your M-Pesa balance.';
            }

            return {
                success: false,
                error: userMessage,
                rawError: error.message
            };
        }
    }

    async querySTKPushStatus(invoiceId) {
        try {
            const resp = await this.collection.status(invoiceId);

            console.log('IntaSend status response:', JSON.stringify(resp, null, 2));

            let status = 'pending';
            let resultCode = '';
            let resultDesc = '';

            if (resp) {
                const state = (resp.state || '').toUpperCase();
                resultDesc = resp.detail || resp.state || '';

                switch (state) {
                    case 'COMPLETE':
                    case 'COMPLETED':
                        status = 'completed';
                        resultCode = '0';
                        break;
                    case 'FAILED':
                    case 'FAIL':
                        status = 'failed';
                        resultCode = '1';
                        break;
                    case 'PENDING':
                        status = 'pending';
                        resultCode = '';
                        break;
                    default:
                        status = 'pending';
                        resultCode = '';
                }
            }

            return {
                success: status !== 'pending',
                status,
                resultCode,
                resultDesc,
                mpesaReceiptNumber: resp && resp.mpesa_reference ? resp.mpesa_reference : null
            };

        } catch (error) {
            console.error('IntaSend status query error:', error.message);
            return { success: false, status: 'pending', error: error.message };
        }
    }
}

module.exports = IntaSendAPI;
