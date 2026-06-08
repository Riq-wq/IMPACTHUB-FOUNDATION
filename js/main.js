document.addEventListener('DOMContentLoaded', function() {
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
            
            // Show M-Pesa modal
            if (window.showMpesaModal) {
                window.showMpesaModal({
                    fullName: data['full-name'] || 'Donor',
                    email: data.email || '',
                    phone: formattedPhone,
                    amount: parseFloat(amount),
                    cause: data.cause || 'Donation'
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
