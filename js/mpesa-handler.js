document.addEventListener('DOMContentLoaded', function() {
    // Get modal elements
    const modal = document.getElementById('mpesa-modal');
    const closeBtn = document.querySelector('.modal-close');
    const cancelBtn = document.getElementById('cancel-payment');
    const closeModalBtn = document.getElementById('close-modal');
    
    // Status tracking
    let checkoutRequestId = null;
    let statusCheckInterval = null;

    // Show modal and initiate payment
    window.showMpesaModal = async function(donationData) {
        if (!modal) return;
        
        // Store donation data
        window.currentDonation = donationData;
        
        // Reset modal state
        resetModal();
        
        // Show modal
        modal.classList.add('show');
        
        // Update phone and amount
        const phoneSpans = document.querySelectorAll('#mpesa-phone');
        const amountSpans = document.querySelectorAll('#mpesa-amount');
        phoneSpans.forEach(span => span.textContent = donationData.phone);
        amountSpans.forEach(span => span.textContent = donationData.amount.toLocaleString());
        
        // Automatically initiate payment
        await initiatePayment(donationData);
    };

    // Reset modal to initial state
    function resetModal() {
        // Clear any existing intervals
        if (statusCheckInterval) clearInterval(statusCheckInterval);
        
        // Reset variables
        checkoutRequestId = null;
        
        // Show/hide sections
        document.getElementById('payment-instructions').style.display = 'none';
        document.getElementById('payment-status').style.display = 'block';
        document.getElementById('payment-result').style.display = 'none';
        document.getElementById('modal-actions').style.display = 'flex';
        document.getElementById('result-actions').style.display = 'none';
        document.getElementById('status-timer').style.display = 'none';
        
        // Reset status
        updateStatus('loading', 'Initializing payment...');
    }

    // Initiate M-Pesa payment
    async function initiatePayment(donation) {
        try {
            updateStatus('loading', 'Sending payment request to M-Pesa...');
            
            const response = await fetch('/api/mpesa/stkpush', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(donation)
            });
            
            const result = await response.json();
            
            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Payment request failed');
            }
            
            // Store checkout request ID
            checkoutRequestId = result.checkoutRequestId;
            
            // Show instructions
            document.getElementById('modal-title').textContent = 'Check Your Phone';
            document.getElementById('modal-message').textContent = 'M-Pesa prompt sent successfully';
            document.getElementById('payment-instructions').style.display = 'block';
            
            // Update status
            updateStatus('waiting', 'Waiting for you to complete payment on your phone...');
            
            // Show waiting indicator
            document.getElementById('status-timer').style.display = 'block';
            
            // Start checking payment status
            startStatusCheck();
            
        } catch (error) {
            console.error('Payment initiation error:', error);
            showError(error.message || 'Failed to send payment request. Please try again.');
        }
    }

    // Start checking payment status - polls every 3 seconds until terminal status
    function startStatusCheck() {
        let attempts = 0;
        const maxAttempts = 25; // ~75 seconds total before timing out
        
        statusCheckInterval = setInterval(async () => {
            attempts++;
            
            // Time out after max attempts
            if (attempts > maxAttempts) {
                clearInterval(statusCheckInterval);
                showError('Payment request timed out. The M-Pesa prompt was not completed on your phone. Please try again.');
                return;
            }
            
            try {
                const response = await fetch(`/api/mpesa/status/${checkoutRequestId}`);
                const result = await response.json();
                
                console.log('Status check result:', result);
                
                if (result.success && result.status !== 'pending') {
                    clearInterval(statusCheckInterval);
                    
                    if (result.status === 'completed') {
                        showSuccess(result.mpesaReceiptNumber);
                    } else if (result.status === 'cancelled') {
                        showError('Payment was cancelled on your phone. Please try again if you wish to donate.');
                    } else {
                        showError(result.message || 'Payment failed. Please try again.');
                    }
                }
            } catch (error) {
                console.error('Status check error:', error);
            }
        }, 3000); // Check every 3 seconds
    }

    // Update status display
    function updateStatus(type, message) {
        const statusIcon = document.getElementById('status-icon');
        const statusText = document.getElementById('status-text');
        
        statusText.textContent = message;
        
        // Update icon based on type
        if (type === 'loading') {
            statusIcon.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        } else if (type === 'waiting') {
            statusIcon.innerHTML = '<i class="fas fa-mobile-alt fa-pulse"></i>';
        }
    }

    // Show success message
    function showSuccess(receiptNumber) {
        // Hide status and instructions
        document.getElementById('payment-status').style.display = 'none';
        document.getElementById('payment-instructions').style.display = 'none';
        document.getElementById('modal-actions').style.display = 'none';
        
        // Show success result
        const resultDiv = document.getElementById('payment-result');
        const resultIcon = document.getElementById('result-icon');
        const resultTitle = document.getElementById('result-title');
        const resultMessage = document.getElementById('result-message');
        const receiptDiv = document.getElementById('receipt-number');
        const receiptValue = document.getElementById('receipt-value');
        
        resultIcon.innerHTML = '<i class="fas fa-check-circle"></i>';
        resultIcon.style.color = '#10b981';
        resultTitle.textContent = 'Payment Successful!';
        resultMessage.textContent = 'Thank you for your generous donation. You will receive a confirmation email shortly.';
        
        if (receiptNumber) {
            receiptValue.textContent = receiptNumber;
            receiptDiv.style.display = 'block';
        }
        
        resultDiv.style.display = 'block';
        document.getElementById('result-actions').style.display = 'flex';
        
        // Reset donation form
        const donationForm = document.getElementById('donation-form');
        if (donationForm) donationForm.reset();
        
        // Clear selected amounts
        document.querySelectorAll('.donation-amount').forEach(btn => {
            btn.classList.remove('active');
        });
    }

    // Show error message
    function showError(message) {
        // Hide status and instructions
        document.getElementById('payment-status').style.display = 'none';
        document.getElementById('payment-instructions').style.display = 'none';
        document.getElementById('modal-actions').style.display = 'none';
        
        // Show error result
        const resultDiv = document.getElementById('payment-result');
        const resultIcon = document.getElementById('result-icon');
        const resultTitle = document.getElementById('result-title');
        const resultMessage = document.getElementById('result-message');
        
        resultIcon.innerHTML = '<i class="fas fa-times-circle"></i>';
        resultIcon.style.color = '#ef4444';
        resultTitle.textContent = 'Payment Failed';
        resultMessage.textContent = message;
        
        resultDiv.style.display = 'block';
        document.getElementById('result-actions').style.display = 'flex';
    }

    // Hide modal
    function hideMpesaModal() {
        if (statusCheckInterval) clearInterval(statusCheckInterval);
        if (modal) modal.classList.remove('show');
    }

    // Close modal events
    if (closeBtn) closeBtn.addEventListener('click', hideMpesaModal);
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            // Clear intervals immediately
            if (statusCheckInterval) clearInterval(statusCheckInterval);
            
            // Show cancellation message
            showError('Payment cancelled. You can try again anytime.');
        });
    }
    if (closeModalBtn) closeModalBtn.addEventListener('click', hideMpesaModal);
    
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                // Only allow closing if payment is complete or failed
                const resultDiv = document.getElementById('payment-result');
                if (resultDiv && resultDiv.style.display !== 'none') {
                    hideMpesaModal();
                }
            }
        });
    }
});
