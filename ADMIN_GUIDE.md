# 🔐 Admin Dashboard Guide

## ✅ What I Fixed

### 1. Facebook Link Issue
The Facebook profile link might not work if:
- Your profile is set to private
- You need to be logged in to view it
- The profile URL format needs adjustment

**Solution:** Make sure your Facebook profile is set to "Public" in privacy settings.

### 2. Payment Error: "Failed to fetch"
This error happens because **the server is not running**.

---

## 🚀 How to Start the Server

Open your terminal in the project folder and run:

```bash
npm start
```

You should see:
```
🚀 ImpactHub Server running on http://localhost:3001
📱 M-Pesa Integration: ✅ Configured
📧 Email Service: ✅ Configured
```

**Keep this terminal window open!** The server must be running for:
- M-Pesa payments to work
- Admin dashboard to load
- Contact form to work (if using backend)

---

## 📊 Admin Dashboard - View All Transactions

I've created a beautiful admin dashboard for you!

### How to Access:

1. **Start the server** (if not running):
   ```bash
   npm start
   ```

2. **Open your browser** and go to:
   ```
   http://localhost:3001/admin.html
   ```

### What You Can See:

✅ **Statistics Dashboard:**
- Total donations amount
- Number of completed transactions
- Number of pending transactions
- Total number of donors

✅ **Transaction List:**
- Date and time of each donation
- Donor name and contact info
- Amount donated
- Cause selected
- Payment status (Completed/Pending/Failed)
- M-Pesa receipt number

✅ **Filter Options:**
- View all transactions
- Filter by completed only
- Filter by pending only
- Filter by failed only

✅ **Export Feature:**
- Download all transactions as CSV file
- Open in Excel or Google Sheets
- Keep records for accounting

✅ **Auto-Refresh:**
- Dashboard updates every 30 seconds automatically
- Manual refresh button available

---

## 🔧 Troubleshooting

### Problem: "Failed to fetch" on payment
**Solution:** 
1. Make sure server is running (`npm start`)
2. Check console for errors
3. Verify M-Pesa credentials in .env file

### Problem: Admin dashboard shows "Failed to load transactions"
**Solution:**
1. Start the server: `npm start`
2. Refresh the admin page
3. Check if server is running on port 3001

### Problem: No transactions showing
**Solution:**
- This is normal if no one has donated yet
- Make a test donation to see it appear
- Check the "All" filter is selected

### Problem: Facebook link not working
**Solution:**
1. Log into Facebook
2. Go to Settings → Privacy
3. Set "Who can see your profile?" to "Public"
4. Or use your Facebook page link instead of profile

---

## 📱 Quick Access Links

When server is running:

- **Main Website:** http://localhost:3001/
- **Admin Dashboard:** http://localhost:3001/admin.html
- **Health Check:** http://localhost:3001/api/health
- **Transactions API:** http://localhost:3001/api/admin/transactions

---

## 🔒 Security Notes

### Admin Dashboard Security:

Currently, the admin dashboard is accessible to anyone who knows the URL. For production, you should:

1. **Add Password Protection:**
   - Use basic authentication
   - Or create a login system

2. **Use HTTPS:**
   - When deployed online
   - Protects data in transit

3. **Restrict Access:**
   - Only access from trusted networks
   - Use VPN if accessing remotely

**For now (testing):** It's fine to use without password since it's on localhost (only you can access it).

---

## 💡 Tips for Using Admin Dashboard

### Daily Monitoring:
1. Open admin dashboard in the morning
2. Check new donations
3. Verify all payments completed
4. Export weekly reports

### Monthly Reports:
1. Filter by date range (coming soon)
2. Export to CSV
3. Open in Excel
4. Create financial reports

### Follow Up:
1. Check pending transactions
2. Contact donors if payment failed
3. Send thank you messages
4. Update your records

---

## 📊 Dashboard Features Explained

### Statistics Cards:
- **Total Donations:** Sum of all completed payments
- **Completed:** Successfully paid donations
- **Pending:** Waiting for payment confirmation
- **Total Donors:** Number of donation attempts

### Transaction Table:
- **Date:** When donation was initiated
- **Donor Name:** From donation form
- **Email:** Donor's email address
- **Phone:** M-Pesa phone number used
- **Amount:** Donation amount in KSH
- **Cause:** Selected cause or "General"
- **Status:** Payment status badge
- **Receipt:** M-Pesa receipt number (if completed)

### Status Badges:
- 🟢 **COMPLETED:** Payment successful, money received
- 🟡 **PENDING:** Waiting for user to complete payment
- 🔴 **FAILED:** Payment was cancelled or failed

---

## 🎯 Next Steps

1. ✅ Start the server: `npm start`
2. ✅ Open admin dashboard: http://localhost:3001/admin.html
3. ✅ Make a test donation to see it appear
4. ✅ Try filtering and exporting
5. ✅ Bookmark the admin URL for easy access

---

## 📞 Quick Commands

```bash
# Start server
npm start

# Stop server
Ctrl + C (in terminal)

# Check if server is running
curl http://localhost:3001/api/health

# View transactions in terminal
curl http://localhost:3001/api/admin/transactions
```

---

## 🌐 When You Deploy Online

When you deploy your website to a hosting service:

1. **Admin URL will be:**
   ```
   https://yourdomain.com/admin.html
   ```

2. **Add password protection** (important!)

3. **Use HTTPS** (automatic with most hosts)

4. **Bookmark the admin URL** for easy access

---

**Your admin dashboard is ready!** 🎉

Start the server and visit: http://localhost:3001/admin.html
