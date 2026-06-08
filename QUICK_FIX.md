# ⚡ Quick Fix - Payment Error & Admin Access

## 🔴 Problem: "Payment Failed - Failed to fetch"

### ✅ Solution: Start the Server!

The payment system needs the server to be running. Here's how:

### Step 1: Open Terminal
- Press `Windows + R`
- Type `cmd` and press Enter
- Navigate to your project folder:
  ```bash
  cd "C:\Users\Hassan\Desktop\IMPACTHUB  FOUNDATION"
  ```

### Step 2: Start the Server
```bash
npm start
```

### Step 3: Keep Terminal Open
**Don't close the terminal!** The server must stay running.

You should see:
```
🚀 ImpactHub Server running on http://localhost:3001
📱 M-Pesa Integration: ✅ Configured
```

---

## 📊 Access Admin Dashboard

Once server is running:

1. Open your browser
2. Go to: **http://localhost:3001/admin.html**
3. You'll see all donations and transactions!

---

## 🔗 Facebook Link Issue

If Facebook link shows "Content not available":

### Option 1: Make Profile Public
1. Go to Facebook Settings
2. Privacy → Profile
3. Set to "Public"

### Option 2: Use Facebook Page Instead
If you have a Facebook page (not profile), use that link instead.

### Option 3: Remove Facebook Link
If you don't want to make profile public, we can remove the Facebook link.

---

## ✅ Quick Checklist

- [ ] Server is running (`npm start`)
- [ ] Terminal window is open
- [ ] Can access website: http://localhost:3001
- [ ] Can access admin: http://localhost:3001/admin.html
- [ ] Test payment works
- [ ] Facebook link works (or removed)

---

## 🎯 What You Can Do Now

### Main Website:
```
http://localhost:3001
```
- Accept donations
- Show your causes
- Contact form

### Admin Dashboard:
```
http://localhost:3001/admin.html
```
- View all donations
- See transaction status
- Export to Excel
- Monitor in real-time

---

## 💡 Remember

**Always start the server before:**
- Testing payments
- Checking admin dashboard
- Accepting donations

**Command to start:**
```bash
npm start
```

**Command to stop:**
```
Press Ctrl + C in terminal
```

---

That's it! Start the server and everything will work! 🚀
