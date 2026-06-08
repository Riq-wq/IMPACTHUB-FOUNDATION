// Retry Handler for M-Pesa API Calls
class RetryHandler {
    constructor(options = {}) {
        this.maxRetries = options.maxRetries || 3;
        this.baseDelay = options.baseDelay || 1000; // 1 second
        this.maxDelay = options.maxDelay || 10000; // 10 seconds
        this.backoffMultiplier = options.backoffMultiplier || 2;
        this.retryableErrors = options.retryableErrors || [
            'ECONNRESET',
            'ENOTFOUND',
            'ECONNREFUSED',
            'ETIMEDOUT',
            'timeout',
            '500',
            '502',
            '503',
            '504'
        ];
    }

    // Check if an error is retryable
    isRetryableError(error) {
        if (!error) return false;

        // Check error message
        const errorMessage = error.message?.toLowerCase() || '';
        if (this.retryableErrors.some(retryableError => 
            errorMessage.includes(retryableError.toLowerCase()))) {
            return true;
        }

        // Check HTTP status codes
        const statusCode = error.response?.status;
        if (statusCode && this.retryableErrors.includes(statusCode.toString())) {
            return true;
        }

        // Check specific M-Pesa error codes that are retryable
        const mpesaErrorCode = error.response?.data?.errorCode;
        const retryableMpesaCodes = [
            '500.001.1001', // Subscriber locked (temporary)
            '1', // Generic temporary error
            '1032' // Request cancelled by user (could retry)
        ];

        if (mpesaErrorCode && retryableMpesaCodes.includes(mpesaErrorCode)) {
            return true;
        }

        return false;
    }

    // Calculate delay with exponential backoff
    calculateDelay(attempt) {
        const delay = this.baseDelay * Math.pow(this.backoffMultiplier, attempt - 1);
        return Math.min(delay, this.maxDelay);
    }

    // Sleep function
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Execute function with retry logic
    async executeWithRetry(fn, context = 'operation') {
        let lastError = null;
        
        for (let attempt = 1; attempt <= this.maxRetries + 1; attempt++) {
            try {
                console.log(`Attempting ${context} (attempt ${attempt}/${this.maxRetries + 1})`);
                
                const result = await fn();
                
                if (attempt > 1) {
                    console.log(`${context} succeeded on attempt ${attempt}`);
                }
                
                return result;
                
            } catch (error) {
                lastError = error;
                
                console.error(`${context} failed on attempt ${attempt}:`, error.message);
                
                // If this is the last attempt, don't retry
                if (attempt > this.maxRetries) {
                    console.error(`${context} failed after ${this.maxRetries + 1} attempts`);
                    break;
                }
                
                // Check if error is retryable
                if (!this.isRetryableError(error)) {
                    console.error(`${context} failed with non-retryable error:`, error.message);
                    break;
                }
                
                // Calculate delay and wait
                const delay = this.calculateDelay(attempt);
                console.log(`Retrying ${context} in ${delay}ms...`);
                await this.sleep(delay);
            }
        }
        
        // If we get here, all attempts failed
        throw lastError;
    }

    // Specific retry wrapper for M-Pesa STK Push
    async retrySTKPush(mpesaInstance, phoneNumber, amount, accountReference, transactionDesc) {
        return this.executeWithRetry(
            () => mpesaInstance.initiateSTKPush(phoneNumber, amount, accountReference, transactionDesc),
            'M-Pesa STK Push'
        );
    }

    // Specific retry wrapper for M-Pesa status query
    async retryStatusQuery(mpesaInstance, checkoutRequestId) {
        return this.executeWithRetry(
            () => mpesaInstance.querySTKPushStatus(checkoutRequestId),
            'M-Pesa Status Query'
        );
    }

    // Specific retry wrapper for access token generation
    async retryGetAccessToken(mpesaInstance) {
        return this.executeWithRetry(
            () => mpesaInstance.getAccessToken(),
            'M-Pesa Access Token'
        );
    }
}

module.exports = RetryHandler;
