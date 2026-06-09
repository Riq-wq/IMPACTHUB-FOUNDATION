document.addEventListener('DOMContentLoaded', function() {
    // Load live impact stats on page load
    loadLiveImpact();
    // Refresh impact stats every 30 seconds
    setInterval(loadLiveImpact, 30000);
    
    // Mobile Navigation Toggle
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const navLinksItems = document.querySelectorAll('.nav-links li');
    
    if (hamburger) {
        hamburger.addEventListener('click', function() {
            this.classList.toggle('active');
            if (navLinks) navLinks.classList.toggle('active');
            document.body.classList.toggle('no-scroll');
        });
    }
    
    // Close mobile menu when clicking on a nav link
    if (navLinksItems) {
        navLinksItems.forEach(item => {
            item.addEventListener('click', function() {
                if (hamburger) hamburger.classList.remove('active');
                if (navLinks) navLinks.classList.remove('active');
                document.body.classList.remove('no-scroll');
            });
        });
    }
    
    // Sticky Header on Scroll
    const header = document.querySelector('.header');
    if (header) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }
    
    // Smooth Scrolling for Anchor Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Active Navigation Link on Scroll
    const sections = document.querySelectorAll('section[id]');
    
    function highlightNavigation() {
        let scrollPosition = window.scrollY + 200;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPosition >= sectionTop && scrollPosition <= sectionTop + sectionHeight) {
                const navLink = document.querySelector(`.nav-links a[href*="${sectionId}"]`);
                if (navLink) navLink.classList.add('active');
            } else {
                const navLink = document.querySelector(`.nav-links a[href*="${sectionId}"]`);
                if (navLink) navLink.classList.remove('active');
            }
        });
    }
    
    window.addEventListener('scroll', highlightNavigation);
    
    // Animate Stats Counter
    const statNumbers = document.querySelectorAll('.stat-number');
    
    function animateStats() {
        statNumbers.forEach(stat => {
            const target = parseInt(stat.getAttribute('data-count'));
            const count = parseInt(stat.textContent);
            const increment = target / 50; // Adjust speed of counting
            
            if (count < target) {
                stat.textContent = Math.ceil(count + increment);
                setTimeout(animateStats, 30);
            } else {
                stat.textContent = target;
            }
        });
    }
    
    // Initialize stats animation when scrolled to stats section
    const statsSection = document.querySelector('.about');
    let statsAnimated = false;
    
    function checkStatsInView() {
        if (!statsSection || statsAnimated) return;
        
        const statsPosition = statsSection.getBoundingClientRect().top;
        const screenPosition = window.innerHeight / 1.3;
        
        if (statsPosition < screenPosition) {
            animateStats();
            statsAnimated = true;
        }
    }
    
    window.addEventListener('scroll', checkStatsInView);
    checkStatsInView();
    
    // Donation Amount Selection
    const donationAmounts = document.querySelectorAll('.donation-amount');
    const customAmountInput = document.getElementById('custom-amount');
    
    if (donationAmounts) {
        donationAmounts.forEach(amount => {
            amount.addEventListener('click', function() {
                // Remove active class from all amount buttons
                donationAmounts.forEach(btn => btn.classList.remove('active'));
                // Add active class to clicked button
                this.classList.add('active');
                // Clear custom amount input
                if (customAmountInput) customAmountInput.value = '';
            });
        });
    }
    
    // Clear selected amount when custom amount is entered
    if (customAmountInput) {
        customAmountInput.addEventListener('focus', function() {
            donationAmounts.forEach(btn => btn.classList.remove('active'));
        });
    }
    
    // Form Submission
    const donationForm = document.getElementById('donation-form');
    
    if (donationForm) {
        donationForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const formData = new FormData(this);
            const data = Object.fromEntries(formData.entries());
            
            // Get donation amount (from buttons or custom input)
            const selectedAmount = document.querySelector('.donation-amount.active');
            const amount = selectedAmount 
                ? selectedAmount.getAttribute('data-amount') 
                : (customAmountInput ? customAmountInput.value : '0');
            
            // Validate amount
            if (!amount || amount <= 0) {
                alert('Please select or enter a valid donation amount');
                return;
            }
            
            // Validate phone number
            const phone = data.phone;
            if (!phone) {
                alert('Please enter your M-Pesa phone number');
                return;
            }
            
            // Clean phone number (remove spaces, dashes, etc.)
            const cleanPhone = phone.replace(/\D/g, '');
            
            // Simple validation - accept any reasonable phone number
            if (cleanPhone.length < 9 || cleanPhone.length > 15 || !/^\d+$/.test(cleanPhone)) {
                alert('Please enter a valid M-Pesa phone number (9-15 digits)');
                return;
            }
            
            // Format phone number if needed (add 254 if it starts with 0 or 7)
            let formattedPhone = cleanPhone;
            if (cleanPhone.startsWith('0')) {
                formattedPhone = '254' + cleanPhone.substring(1);
            } else if (cleanPhone.startsWith('7')) {
                formattedPhone = '254' + cleanPhone;
            }
            
            // Store donation data globally for receipt generation
            window.lastDonationData = {
                fullName: data['full-name'] || 'Anonymous Donor',
                email: data.email || '',
                phone: formattedPhone,
                amount: parseFloat(amount),
                cause: data.cause || 'Where it\'s needed most',
                message: data['donation-message'] || '',
                anonymous: data.anonymous === 'on',
                date: new Date().toISOString()
            };
            
            // Show M-Pesa modal
            if (window.showMpesaModal) {
                window.showMpesaModal({
                    fullName: window.lastDonationData.anonymous ? 'Anonymous' : data['full-name'],
                    email: data.email || '',
                    phone: formattedPhone,
                    amount: parseFloat(amount),
                    cause: data.cause || 'Donation',
                    message: data['donation-message'] || '',
                    anonymous: data.anonymous === 'on'
                });
            } else {
                alert('Payment system is not available. Please try again later.');
            }
        });
    }
    
    // Contact form submission (using Formspree)
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const submitButton = this.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            
            // Disable button and show loading state
            submitButton.disabled = true;
            submitButton.textContent = 'Sending...';
            
            try {
                const formData = new FormData(this);
                
                const response = await fetch(this.action, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });
                
                if (response.ok) {
                    alert('Thank you for your message! We will get back to you soon.');
                    this.reset();
                } else {
                    const data = await response.json();
                    if (data.errors) {
                        alert('Oops! There was a problem: ' + data.errors.map(error => error.message).join(', '));
                    } else {
                        alert('Oops! There was a problem submitting your form. Please try again.');
                    }
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Failed to send message. Please try again or email us directly at mrisajuma384@gmail.com');
            } finally {
                // Re-enable button
                submitButton.disabled = false;
                submitButton.textContent = originalText;
            }
        });
    }
});


// Load Live Impact Statistics
async function loadLiveImpact() {
    try {
        const response = await fetch('/api/impact/stats');
        const data = await response.json();
        
        if (data.success) {
            // Animate the numbers
            animateValue('total-raised', 0, data.totalRaised, 2000, 'KSH ');
            animateValue('total-donations-count', 0, data.totalDonations, 2000);
            animateValue('total-donors-count', 0, data.totalDonors, 2000);
            animateValue('lives-impacted', 0, data.livesImpacted, 2000);
        }
    } catch (error) {
        console.log('Could not load live impact stats:', error);
        // Set default values if API fails
        document.getElementById('total-raised').textContent = 'KSH 0';
        document.getElementById('total-donations-count').textContent = '0';
        document.getElementById('total-donors-count').textContent = '0';
        document.getElementById('lives-impacted').textContent = '0';
    }
}

// Animate number counting
function animateValue(elementId, start, end, duration, prefix = '', suffix = '') {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
            current = end;
            clearInterval(timer);
        }
        
        const displayValue = Math.floor(current);
        element.textContent = prefix + displayValue.toLocaleString() + suffix;
    }, 16);
}

// Download Receipt as PDF (simple HTML-based receipt)
window.downloadReceipt = function() {
    const donation = window.lastDonationData;
    const receiptNumber = document.getElementById('receipt-value').textContent;
    
    if (!donation) {
        alert('Receipt data not available');
        return;
    }
    
    // Create receipt HTML
    const receiptHTML = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Donation Receipt - ${receiptNumber}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 40px auto;
            padding: 40px;
            background: white;
        }
        .receipt-header {
            text-align: center;
            border-bottom: 3px solid #667eea;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .receipt-header h1 {
            color: #667eea;
            margin: 0;
        }
        .receipt-details {
            margin: 30px 0;
        }
        .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #eee;
        }
        .detail-label {
            font-weight: bold;
            color: #666;
        }
        .detail-value {
            color: #333;
        }
        .amount-box {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 10px;
            margin: 30px 0;
        }
        .amount-box h2 {
            margin: 0;
            font-size: 2.5rem;
        }
        .footer {
            text-align: center;
            margin-top: 50px;
            padding-top: 20px;
            border-top: 2px solid #eee;
            color: #666;
            font-size: 0.9rem;
        }
        .thank-you {
            text-align: center;
            color: #667eea;
            font-size: 1.5rem;
            margin: 30px 0;
            font-weight: bold;
        }
        @media print {
            body {
                margin: 0;
                padding: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="receipt-header">
        <h1>🙏 ImpactHub Foundation</h1>
        <p>Official Donation Receipt</p>
    </div>
    
    <div class="receipt-details">
        <div class="detail-row">
            <span class="detail-label">Receipt Number:</span>
            <span class="detail-value">${receiptNumber}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Date:</span>
            <span class="detail-value">${new Date(donation.date).toLocaleString()}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Donor Name:</span>
            <span class="detail-value">${donation.anonymous ? 'Anonymous Donor' : donation.fullName}</span>
        </div>
        ${donation.email && !donation.anonymous ? `
        <div class="detail-row">
            <span class="detail-label">Email:</span>
            <span class="detail-value">${donation.email}</span>
        </div>
        ` : ''}
        <div class="detail-row">
            <span class="detail-label">Cause:</span>
            <span class="detail-value">${donation.cause}</span>
        </div>
        ${donation.message ? `
        <div class="detail-row">
            <span class="detail-label">Message:</span>
            <span class="detail-value">${donation.message}</span>
        </div>
        ` : ''}
    </div>
    
    <div class="amount-box">
        <p style="margin: 0; opacity: 0.9;">Donation Amount</p>
        <h2>KSH ${donation.amount.toLocaleString()}</h2>
    </div>
    
    <div class="thank-you">
        Thank You for Your Generous Contribution!
    </div>
    
    <p style="text-align: center; color: #666;">
        Your donation will help us continue our mission of creating meaningful change
        in communities around the world. We are deeply grateful for your support.
    </p>
    
    <div class="footer">
        <p><strong>ImpactHub Foundation</strong></p>
        <p>Nairobi, Kenya</p>
        <p>Email: mrisajuma384@gmail.com | Phone: +254 826 623 42</p>
        <p style="margin-top: 20px; font-size: 0.8rem;">
            This is an official donation receipt. Please keep it for your records.
        </p>
    </div>
</body>
</html>
    `;
    
    // Create blob and download
    const blob = new Blob([receiptHTML], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ImpactHub_Receipt_${receiptNumber}_${Date.now()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    alert('Receipt downloaded! Open the HTML file in your browser and press Ctrl+P to print as PDF.');
};
