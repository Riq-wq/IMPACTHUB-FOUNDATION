const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path');
const crypto = require('crypto');
const MpesaAPI = require('./mpesa-config');
const FirebaseDB = require('./firebase-config'); // Using Firebase now!
const RetryHandler = require('./retry-handler');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize M-Pesa API and Firebase Database
const mpesa = new MpesaAPI();
const transactionDB = new FirebaseDB(); // Using Firebase!

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Email transporter configuration
const transporter = nodemailer.createTransport({
    service: 'gmail', // You can change this to your preferred email service
    auth: {
        user: process.env.EMAIL_USER, // Your email address
        pass: process.env.EMAIL_PASS  // Your email password or app password
    }
});

// Email templates
const generateThankYouEmail = (donorName, amount, cause, mpesaReceiptNumber = null) => {
    return {
        subject: 'Thank You for Your Generous Donation - ImpactHub',
        html: `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Thank You for Your Donation</title>
            <style>
                body {
                    font-family: 'Arial', sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                }
                .header {
                    background: linear-gradient(135deg, #2563eb, #1e40af);
                    color: white;
                    padding: 30px;
                    text-align: center;
                    border-radius: 10px 10px 0 0;
                }
                .content {
                    background: #f8fafc;
                    padding: 30px;
                    border-radius: 0 0 10px 10px;
                }
                .donation-details {
                    background: white;
                    padding: 20px;
                    border-radius: 8px;
                    margin: 20px 0;
                    border-left: 4px solid #2563eb;
                }
                .impact-section {
                    background: #e0f2fe;
                    padding: 20px;
                    border-radius: 8px;
                    margin: 20px 0;
                }
                .footer {
                    text-align: center;
                    margin-top: 30px;
                    padding-top: 20px;
                    border-top: 1px solid #e5e7eb;
                    color: #6b7280;
                }
                .btn {
                    display: inline-block;
                    background-color: #2563eb;
                    color: white;
                    padding: 12px 24px;
                    text-decoration: none;
                    border-radius: 25px;
                    margin: 10px 0;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>🙏 Thank You, ${donorName}!</h1>
                <p>Your generosity is making a real difference</p>
            </div>
            
            <div class="content">
                <h2>Dear ${donorName},</h2>
                
                <p>We are incredibly grateful for your generous donation to ImpactHub. Your contribution will help us continue our mission of creating meaningful change in communities around the world.</p>
                
                <div class="donation-details">
                    <h3>📋 Donation Details</h3>
                    <p><strong>Amount:</strong> KSH ${amount}</p>
                    <p><strong>Cause:</strong> ${cause || 'Where it\'s needed most'}</p>
                    <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
                    ${mpesaReceiptNumber ? `<p><strong>M-Pesa Receipt:</strong> ${mpesaReceiptNumber}</p>` : ''}
                    <p><strong>Transaction ID:</strong> TXN-${Date.now()}</p>
                </div>
                
                <div class="impact-section">
                    <h3>🌟 Your Impact</h3>
                    <p>Here's what your donation of KSH ${amount} can help achieve:</p>
                    <ul>
                        ${getImpactMessage(amount)}
                    </ul>
                </div>
                
                <p>We will keep you updated on how your donation is being used and the impact it's making. You can also visit our website anytime to see the latest updates on our projects.</p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="http://localhost:3001" class="btn">Visit Our Website</a>
                </div>
                
                <p>Once again, thank you for your kindness and generosity. Together, we are making the world a better place.</p>
                
                <p>With heartfelt gratitude,<br>
                <strong>The ImpactHub Team</strong></p>
            </div>
            
            <div class="footer">
                <p>ImpactHub Foundation | Nairobi, Kenya</p>
                <p>Email: mrisajuma384@gmail.com | Phone: +254 826 623 42</p>
                <p>This is an automated message. Please do not reply to this email.</p>
            </div>
        </body>
        </html>
        `
    };
};

// Function to generate impact message based on donation amount
const getImpactMessage = (amount) => {
    const impacts = [];
    
    if (amount >= 25) {
        impacts.push('<li>Provide clean water for 5 people for one month</li>');
    }
    if (amount >= 50) {
        impacts.push('<li>Supply school materials for 2 children</li>');
    }
    if (amount >= 100) {
        impacts.push('<li>Fund medical supplies for a small clinic</li>');
    }
    if (amount >= 250) {
        impacts.push('<li>Support a family\'s basic needs for one month</li>');
    }
    if (amount >= 500) {
        impacts.push('<li>Help build infrastructure in underserved communities</li>');
    }
    
    return impacts.join('') || '<li>Make a meaningful difference in someone\'s life</li>';
};

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Test endpoint for M-Pesa
app.get('/test-mpesa', (req, res) => {
    res.sendFile(path.join(__dirname, 'test-mpesa.html'));
});

// M-Pesa STK Push endpoint
app.post('/api/mpesa/stkpush', async (req, res) => {
    try {
        const { fullName, email, phone, amount, cause, message, anonymous } = req.body;
        
        console.log('=== Received STK Push Request ===');
        console.log('Request Body:', { fullName, email, phone, amount, cause, anonymous });
        
        // Validate required fields
        if (!fullName || !email || !phone || !amount) {
            console.error('Missing required fields');
            return res.status(400).json({ 
                success: false, 
                message: 'Missing required fields: fullName, email, phone, and amount are required' 
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            console.error('Invalid email format:', email);
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid email format' 
            });
        }

        // Validate amount
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) {
            console.error('Invalid amount:', amount);
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid amount. Must be a positive number' 
            });
        }

        if (numAmount < 1 || numAmount > 150000) {
            console.error('Amount out of range:', numAmount);
            return res.status(400).json({ 
                success: false, 
                message: 'Amount must be between KSH 1 and KSH 150,000' 
            });
        }

        // Use the configured account number as reference
        const accountReference = process.env.MPESA_ACCOUNT_NUMBER || `DON${Date.now().toString().slice(-8)}`;
        const transactionDesc = cause ? cause.substring(0, 13) : 'ImpactHub';
        
        console.log('Processing M-Pesa donation:', {
            fullName,
            email,
            phone,
            amount: numAmount,
            cause,
            accountReference,
            transactionDesc
        });
        
        // Check M-Pesa configuration
        if (!process.env.MPESA_CONSUMER_KEY || !process.env.MPESA_CONSUMER_SECRET) {
            console.error('M-Pesa credentials not configured');
            return res.status(500).json({
                success: false,
                message: 'M-Pesa payment system is not configured. Please contact support.'
            });
        }
        
        console.log('Initiating STK Push...');
        const stkResult = await mpesa.initiateSTKPush(
            phone, 
            numAmount, 
            accountReference, 
            transactionDesc
        );

        console.log('STK Push Result:', stkResult);

        if (!stkResult.success) {
            console.error('STK Push failed:', stkResult.error);
            return res.status(400).json({
                success: false,
                message: stkResult.error || 'Payment request failed. Please try again.'
            });
        }

        // Store transaction details in database
        const transactionData = {
            checkoutRequestId: stkResult.checkoutRequestId,
            merchantRequestId: stkResult.merchantRequestId,
            fullName: anonymous ? 'Anonymous Donor' : fullName,
            email,
            phone,
            amount: numAmount,
            cause,
            message: message || '',
            anonymous: anonymous || false,
            accountReference,
            status: 'pending',
            initiatedAt: new Date().toISOString(),
            userAgent: req.get('User-Agent'),
            ipAddress: req.ip || req.connection.remoteAddress
        };

        // Save to database
        await transactionDB.saveTransaction(transactionData);
        
        console.log('Transaction saved to database:', stkResult.checkoutRequestId);
        console.log('=== STK Push Request Completed Successfully ===');

        res.json({
            success: true,
            message: 'Payment request sent to your phone',
            checkoutRequestId: stkResult.checkoutRequestId,
            customerMessage: stkResult.customerMessage || 'Check your phone for M-Pesa prompt'
        });

    } catch (error) {
        console.error('=== Error in STK Push Endpoint ===');
        console.error('Error Message:', error.message);
        console.error('Error Stack:', error.stack);
        
        // Provide more specific error messages
        let userMessage = 'Error processing payment request. Please try again.';
        
        if (error.message.includes('access token')) {
            userMessage = 'Unable to connect to M-Pesa. Please check your credentials.';
        } else if (error.message.includes('Phone number')) {
            userMessage = 'Invalid phone number format. Please use format: 254XXXXXXXXX';
        } else if (error.message.includes('timeout')) {
            userMessage = 'Request timed out. Please check your internet connection and try again.';
        } else if (error.message.includes('M-Pesa API Error')) {
            userMessage = error.message.replace('M-Pesa API Error: ', '');
        }
        
        res.status(500).json({ 
            success: false, 
            message: userMessage,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// M-Pesa callback endpoint
app.post('/api/mpesa/callback', async (req, res) => {
    try {
        console.log('M-Pesa Callback received:', JSON.stringify(req.body, null, 2));
        
        // Validate callback structure - handle both sandbox and production formats
        const callback = req.body.Body?.stkCallback || req.body;
        
        if (!callback) {
            console.error('Invalid callback structure');
            return res.status(400).json({ ResultCode: 1, ResultDesc: 'Invalid callback structure' });
        }
        
        const { Body } = req.body;
        const { stkCallback } = Body;
        const { CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = stkCallback;

        if (!CheckoutRequestID) {
            console.error('Missing CheckoutRequestID in callback');
            return res.status(400).json({ ResultCode: 1, ResultDesc: 'Missing CheckoutRequestID' });
        }

        // Get transaction data from database
        const transactionData = await transactionDB.getTransaction(CheckoutRequestID);
        
        if (!transactionData) {
            console.log('Transaction not found for CheckoutRequestID:', CheckoutRequestID);
            return res.json({ ResultCode: 0, ResultDesc: 'Success' });
        }

        // Extract payment details from callback metadata
        let mpesaReceiptNumber = null;
        let transactionDate = null;
        let phoneNumber = null;
        
        if (ResultCode === 0 && CallbackMetadata && CallbackMetadata.Item) {
            CallbackMetadata.Item.forEach(item => {
                if (item.Name === 'MpesaReceiptNumber') {
                    mpesaReceiptNumber = item.Value;
                } else if (item.Name === 'TransactionDate') {
                    transactionDate = item.Value;
                } else if (item.Name === 'PhoneNumber') {
                    phoneNumber = item.Value;
                }
            });
        }

        if (ResultCode === 0) {
            // Payment successful
            console.log('Payment successful for:', transactionData.fullName, 'Receipt:', mpesaReceiptNumber);
            
            // Update transaction with M-Pesa details
            const updateData = {
                status: 'completed',
                completedAt: new Date().toISOString(),
                mpesaReceiptNumber,
                transactionDate,
                resultCode: ResultCode,
                resultDescription: ResultDesc
            };
            
            await transactionDB.updateTransaction(CheckoutRequestID, updateData);
            
            // Send thank you email
            try {
                const emailContent = generateThankYouEmail(
                    transactionData.fullName, 
                    transactionData.amount, 
                    transactionData.cause,
                    mpesaReceiptNumber
                );
                
                await transporter.sendMail({
                    from: process.env.EMAIL_USER,
                    to: transactionData.email,
                    subject: emailContent.subject,
                    html: emailContent.html
                });

                // Send notification to organization
                await transporter.sendMail({
                    from: process.env.EMAIL_USER,
                    to: process.env.NOTIFICATION_EMAIL || process.env.EMAIL_USER,
                    subject: `New Donation Received - KSH ${transactionData.amount}`,
                    html: `
                        <h2>New M-Pesa Donation Alert</h2>
                        <p><strong>Donor:</strong> ${transactionData.fullName}</p>
                        <p><strong>Email:</strong> ${transactionData.email}</p>
                        <p><strong>Phone:</strong> ${transactionData.phone}</p>
                        <p><strong>Amount:</strong> KSH ${transactionData.amount}</p>
                        <p><strong>Cause:</strong> ${transactionData.cause || 'Where it\'s needed most'}</p>
                        <p><strong>Reference:</strong> ${transactionData.accountReference}</p>
                        <p><strong>M-Pesa Receipt:</strong> ${mpesaReceiptNumber || 'N/A'}</p>
                        <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
                    `
                });
                
                console.log('Confirmation emails sent successfully');
            } catch (emailError) {
                console.error('Error sending emails:', emailError);
            }
            
        } else {
            // Payment failed
            console.log('Payment failed:', ResultDesc);
            
            const updateData = {
                status: 'failed',
                failedAt: new Date().toISOString(),
                resultCode: ResultCode,
                resultDescription: ResultDesc,
                failureReason: ResultDesc
            };
            
            await transactionDB.updateTransaction(CheckoutRequestID, updateData);
        }

        // Log callback completion
        console.log(`Transaction ${CheckoutRequestID} processed: ${ResultCode === 0 ? 'SUCCESS' : 'FAILED'}`);

        res.json({ ResultCode: 0, ResultDesc: 'Success' });

    } catch (error) {
        console.error('Error processing M-Pesa callback:', error);
        res.json({ ResultCode: 1, ResultDesc: 'Error processing callback' });
    }
});

// Check payment status endpoint
app.get('/api/mpesa/status/:checkoutRequestId', async (req, res) => {
    try {
        const { checkoutRequestId } = req.params;
        
        console.log('Checking status for:', checkoutRequestId);
        
        // Check database for transaction data
        const transactionData = await transactionDB.getTransaction(checkoutRequestId);
        
        if (transactionData && transactionData.status !== 'pending') {
            console.log('Status from database:', transactionData.status);
            return res.json({
                success: true,
                status: transactionData.status,
                message: transactionData.status === 'completed' ? 'Payment successful' : 'Payment failed',
                mpesaReceiptNumber: transactionData.mpesaReceiptNumber
            });
        }

        // Check if transaction has been pending too long (> 90 seconds)
        if (transactionData && transactionData.initiatedAt) {
            const initiatedTime = new Date(transactionData.initiatedAt).getTime();
            const elapsed = Date.now() - initiatedTime;
            
            if (elapsed > 90000) {
                console.log('Transaction timed out after 90 seconds:', checkoutRequestId);
                await transactionDB.updateTransaction(checkoutRequestId, {
                    status: 'failed',
                    resultCode: '1037',
                    resultDescription: 'Request timed out',
                    failedAt: new Date().toISOString()
                });
                return res.json({
                    success: true,
                    status: 'failed',
                    message: 'Payment request timed out. Please try again.'
                });
            }
        }

        // Query M-Pesa API for status
        console.log('Querying M-Pesa API for status...');
        const statusResult = await mpesa.querySTKPushStatus(checkoutRequestId);
        
        console.log('M-Pesa status result:', statusResult);
        
        if (statusResult.success) {
            // Return the status from M-Pesa
            const response = {
                success: true,
                status: statusResult.status,
                message: statusResult.resultDesc || statusResult.status,
                resultCode: statusResult.resultCode
            };
            
            // If payment is completed or failed, update database
            if (statusResult.status === 'completed' || statusResult.status === 'failed' || statusResult.status === 'cancelled') {
                await transactionDB.updateTransaction(checkoutRequestId, {
                    status: statusResult.status,
                    resultCode: statusResult.resultCode,
                    resultDescription: statusResult.resultDesc,
                    [statusResult.status === 'completed' ? 'completedAt' : 'failedAt']: new Date().toISOString()
                });
            }
            
            res.json(response);
        } else {
            res.json({
                success: true,
                status: 'pending',
                message: 'Payment still pending'
            });
        }

    } catch (error) {
        console.error('Error checking payment status:', error);
        res.json({ 
            success: true,
            status: 'pending',
            message: 'Payment still pending'
        });
    }
});

// Legacy donation endpoint (for fallback)
app.post('/api/donate', async (req, res) => {
    try {
        const { fullName, email, amount, cause } = req.body;
        
        // Validate required fields
        if (!fullName || !email || !amount) {
            return res.status(400).json({ 
                success: false, 
                message: 'Missing required fields' 
            });
        }
        
        // Generate thank you email
        const emailContent = generateThankYouEmail(fullName, amount, cause);
        
        // Send email to donor
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: emailContent.subject,
            html: emailContent.html
        };
        
        await transporter.sendMail(mailOptions);
        
        // Send notification to organization (optional)
        const notificationEmail = {
            from: process.env.EMAIL_USER,
            to: process.env.NOTIFICATION_EMAIL || process.env.EMAIL_USER,
            subject: `New Donation Received - KSH ${amount}`,
            html: `
                <h2>New Donation Alert</h2>
                <p><strong>Donor:</strong> ${fullName}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Amount:</strong> KSH ${amount}</p>
                <p><strong>Cause:</strong> ${cause || 'Where it\'s needed most'}</p>
                <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
            `
        };
        
        await transporter.sendMail(notificationEmail);
        
        res.json({ 
            success: true, 
            message: 'Donation processed and thank you email sent successfully!',
            transactionId: `TXN-${Date.now()}`
        });
        
    } catch (error) {
        console.error('Error processing donation:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error processing donation. Please try again.' 
        });
    }
});

// Contact form endpoint
app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;
        
        if (!name || !email || !subject || !message) {
            return res.status(400).json({ 
                success: false, 
                message: 'Missing required fields' 
            });
        }
        
        // Send contact form email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.NOTIFICATION_EMAIL || process.env.EMAIL_USER,
            subject: `Contact Form: ${subject}`,
            html: `
                <h2>New Contact Form Submission</h2>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Subject:</strong> ${subject}</p>
                <p><strong>Message:</strong></p>
                <p>${message.replace(/\n/g, '<br>')}</p>
            `
        };
        
        await transporter.sendMail(mailOptions);
        
        // Send confirmation email to sender
        const confirmationEmail = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Thank you for contacting ImpactHub',
            html: `
                <h2>Thank you for reaching out!</h2>
                <p>Dear ${name},</p>
                <p>We have received your message and will get back to you within 24-48 hours.</p>
                <p><strong>Your message:</strong></p>
                <p>${message.replace(/\n/g, '<br>')}</p>
                <br>
                <p>Best regards,<br>The ImpactHub Team</p>
            `
        };
        
        await transporter.sendMail(confirmationEmail);
        
        res.json({ 
            success: true, 
            message: 'Message sent successfully!' 
        });
        
    } catch (error) {
        console.error('Error sending contact form:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error sending message. Please try again.' 
        });
    }
});

// Admin endpoint to view recent transactions (for debugging/monitoring)
app.get('/api/admin/transactions', async (req, res) => {
    try {
        // In production, add proper authentication here
        const limit = parseInt(req.query.limit) || 20;
        const transactions = await transactionDB.getRecentTransactions(limit);
        
        // Remove sensitive data before sending
        const sanitizedTransactions = transactions.map(tx => ({
            checkoutRequestId: tx.checkoutRequestId,
            fullName: tx.fullName,
            amount: tx.amount,
            cause: tx.cause,
            status: tx.status,
            createdAt: tx.createdAt,
            completedAt: tx.completedAt,
            mpesaReceiptNumber: tx.mpesaReceiptNumber
        }));
        
        res.json({
            success: true,
            transactions: sanitizedTransactions,
            total: sanitizedTransactions.length
        });
        
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching transactions'
        });
    }
});

// Cleanup old transactions endpoint
app.post('/api/admin/cleanup', async (req, res) => {
    try {
        const daysOld = parseInt(req.body.daysOld) || 30;
        const cleanedCount = await transactionDB.cleanupOldTransactions(daysOld);
        
        res.json({
            success: true,
            message: `Cleaned up ${cleanedCount} old transactions`,
            cleanedCount
        });
        
    } catch (error) {
        console.error('Error cleaning up transactions:', error);
        res.status(500).json({
            success: false,
            message: 'Error cleaning up transactions'
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        mpesa: {
            configured: !!(process.env.MPESA_CONSUMER_KEY && process.env.MPESA_CONSUMER_SECRET),
            environment: process.env.NODE_ENV || 'development'
        },
        email: {
            configured: !!(process.env.EMAIL_USER && process.env.EMAIL_PASS)
        }
    });
});

// Impact statistics endpoint (for live display on homepage)
app.get('/api/impact/stats', async (req, res) => {
    try {
        const stats = await transactionDB.getStatistics();
        
        // Calculate this month's donations
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        
        const allTransactions = await transactionDB.getRecentTransactions(1000);
        const thisMonthTransactions = allTransactions.filter(t => {
            const txDate = new Date(t.createdAt || t.initiatedAt);
            return txDate >= firstDayOfMonth && t.status === 'completed';
        });
        
        const thisMonthTotal = thisMonthTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
        
        // Estimate lives impacted (rough calculation: KSH 100 = 1 life impacted)
        const livesImpacted = Math.floor(stats.totalAmount / 100);
        
        res.json({
            success: true,
            totalRaised: thisMonthTotal,
            totalDonations: stats.completedCount,
            totalDonors: stats.totalTransactions,
            livesImpacted: livesImpacted,
            allTimeTotal: stats.totalAmount
        });
    } catch (error) {
        console.error('Error fetching impact stats:', error);
        res.json({
            success: true,
            totalRaised: 0,
            totalDonations: 0,
            totalDonors: 0,
            livesImpacted: 0,
            allTimeTotal: 0
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log('\n' + '='.repeat(60));
    console.log('🚀 ImpactHub Server running on http://localhost:' + PORT);
    console.log('='.repeat(60));
    
    // M-Pesa Status
    const mpesaConfigured = !!(process.env.MPESA_CONSUMER_KEY && process.env.MPESA_CONSUMER_SECRET);
    const isProduction = process.env.NODE_ENV === 'production' && process.env.MPESA_BUSINESS_SHORTCODE !== '174379';
    
    console.log('\n📱 M-Pesa Integration:');
    if (mpesaConfigured) {
        if (isProduction) {
            console.log('   ✅ PRODUCTION MODE - Real money will be transferred!');
            console.log('   💰 Money goes to: ' + process.env.MPESA_BUSINESS_SHORTCODE);
            console.log('   🔗 Callback URL: ' + (process.env.MPESA_CALLBACK_URL || 'Not set'));
            
            if (!process.env.MPESA_CALLBACK_URL || process.env.MPESA_CALLBACK_URL === 'https://mydomain.com/pat') {
                console.log('   ⚠️  WARNING: Callback URL not properly configured!');
                console.log('   ⚠️  Payments may not complete without a valid callback URL');
            }
        } else {
            console.log('   🧪 SANDBOX MODE - Testing only (no real money)');
            console.log('   ℹ️  To receive real money:');
            console.log('      1. Get production credentials from Safaricom (0711 071 000)');
            console.log('      2. Update .env file with real credentials');
            console.log('      3. Set NODE_ENV=production');
            console.log('      4. Read: HOW_TO_RECEIVE_REAL_MONEY.md');
        }
    } else {
        console.log('   ❌ Not Configured - Set credentials in .env file');
    }
    
    // Email Status
    console.log('\n📧 Email Service:');
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        console.log('   ✅ Configured - Emails will be sent');
    } else {
        console.log('   ❌ Not Configured - Set EMAIL_USER and EMAIL_PASS in .env');
    }
    
    console.log('\n🔥 Database:');
    console.log('   ✅ Firebase Firestore - Cloud database active');
    console.log('   ✅ Real-time sync enabled');
    console.log('   ✅ Automatic backups active');
    
    console.log('\n🌍 Environment: ' + (process.env.NODE_ENV || 'development'));
    console.log('\n' + '='.repeat(60));
    console.log('📚 Quick Links:');
    console.log('   Website: http://localhost:' + PORT);
    console.log('   Health Check: http://localhost:' + PORT + '/api/health');
    console.log('   Transactions: http://localhost:' + PORT + '/api/admin/transactions');
    console.log('='.repeat(60) + '\n');
    
    // Test Firebase connection
    console.log('🔥 Testing Firebase connection...');
    transactionDB.getStatistics().then(stats => {
        console.log('✅ Firebase connected successfully!');
        console.log('   Total transactions:', stats.totalTransactions);
        console.log('   Completed:', stats.completedCount);
        console.log('   Total amount: KSH', stats.totalAmount.toLocaleString());
    }).catch(err => {
        console.error('❌ Firebase connection error:', err.message);
        console.error('   Please check your Firebase configuration');
    });
    
    // Cleanup old transactions on startup (optional)
    // transactionDB.cleanupOldTransactions(30).then(count => {
    //     if (count > 0) {
    //         console.log(`🧹 Cleaned up ${count} old transactions on startup`);
    //     }
    // }).catch(err => {
    //     console.error('Error during startup cleanup:', err);
    // });
});
