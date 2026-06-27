# ImpactHub - Donor & Partnership Website

A modern, responsive website for donations and partnerships with automated email notifications for donors.

## Features

-  Modern, responsive design
-  Interactive donation system
-  Automated email notifications for donors
-  Partnership information and tiers
-  Mobile-friendly interface
-  Smooth animations and transitions
-  Impact statistics counter
-  Contact form with email notifications

## Email Notifications

When a donor makes a donation, they automatically receive:
- A personalized thank you email
- Donation receipt with transaction ID
- Impact information showing what their donation can achieve
- Organization contact information

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Email Settings

1. Copy the example environment file:
```bash
copy .env.example .env
```

2. Edit the `.env` file with your email credentials:

```env
# For Gmail (recommended):
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Where to receive donation notifications:
NOTIFICATION_EMAIL=admin@impacthub.org

# Server port:
PORT=3000
```

### 3. Gmail Setup (Recommended)

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
   - Use this password in the `EMAIL_PASS` field

### 4. Alternative Email Services

You can also use other email services by modifying the transporter configuration in `server.js`:

**Outlook/Hotmail:**
```javascript
service: 'hotmail'
```

**Yahoo:**
```javascript
service: 'yahoo'
```

**Custom SMTP:**
```javascript
host: 'your-smtp-server.com',
port: 587,
secure: false,
auth: {
    user: 'your-email@domain.com',
    pass: 'your-password'
}
```

### 5. Start the Server

```bash
npm start
```

Or for development with auto-restart:
```bash
npm run dev
```

### 6. Access the Website

Open your browser and go to: `http://localhost:3000`

## Project Structure

```
├── index.html          # Main HTML file
├── css/
│   └── style.css       # Stylesheet
├── js/
│   └── main.js         # Frontend JavaScript
├── server.js           # Backend server with email functionality
├── package.json        # Dependencies and scripts
├── .env.example        # Environment variables template
└── README.md          # This file
```

## API Endpoints

### POST /api/donate
Processes donations and sends thank you emails.

**Request Body:**
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "amount": 100,
  "cause": "healthcare"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Donation processed and thank you email sent successfully!",
  "transactionId": "TXN-1234567890"
}
```

### POST /api/contact
Handles contact form submissions.

**Request Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "subject": "Partnership Inquiry",
  "message": "I'm interested in becoming a partner..."
}
```

## Email Templates

The system includes professionally designed email templates:

- **Donor Thank You Email**: Personalized with donation details and impact information
- **Organization Notification**: Alert when new donations are received
- **Contact Form Confirmation**: Acknowledgment for contact form submissions

## Customization

### Changing Colors
Edit the CSS variables in `css/style.css`:
```css
:root {
    --primary-color: #2563eb;
    --secondary-color: #1e40af;
    --accent-color: #3b82f6;
    /* ... */
}
```

### Modifying Email Templates
Edit the `generateThankYouEmail` function in `server.js` to customize the email content and styling.

### Adding New Causes
Update both the HTML select options and the impact message function in `server.js`.

## Security Notes

- Never commit your `.env` file to version control
- Use app passwords instead of regular passwords for Gmail
- Consider using environment variables in production
- Implement rate limiting for production use

## Deployment

For production deployment:

1. Set environment variables on your hosting platform
2. Use a process manager like PM2
3. Set up SSL certificates
4. Configure a reverse proxy (nginx/Apache)
5. Implement proper logging and monitoring

## Support

For questions or issues, please contact the development team or create an issue in the project repository.
