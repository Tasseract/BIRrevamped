# Quick Implementation Guide

## Setup Instructions

### 1. Update Database Schema
```bash
cd c:\Users\jhale\Documents\Codes\BIRrevamped
npx prisma migrate deploy
```

If you need to create a fresh migration:
```bash
npx prisma migrate dev --name add_business_approval_workflow
```

### 2. Restart Server
```bash
# Terminal in BIRrevamped folder
node server.js
```

The server will be running on `http://localhost:3000`

---

## Testing the Workflow

### Step 1: Create a New User
1. Go to `http://localhost:3000` (or your host URL)
2. Click "Sign Up"
3. Fill in:
   - First Name: John
   - Last Name: Doe
   - TIN: 123-456-789-012
   - Email: john@example.com
   - Password: password123
4. Click "Sign Up"

### Step 2: Login
1. Go to login page
2. Enter email and password from signup
3. Click "Log In"
4. You'll be redirected to **Dashboard**

### Step 3: View Locked Dashboard
- You should see all tools (Form Simulation, Payments, Transactions) with:
  - 50% opacity
  - "🔒 Register a business first to unlock this tool" overlay
  - Disabled click handling

### Step 4: Register Business
1. Click "Register a Business" (only unlocked tool)
2. Fill in all required fields:
   - **Business Section:**
     - Business Name: ABC Trading Company
     - Business TIN: 234-567-890-123
     - Business Type: Sole Proprietorship
     - Business Address: 123 Main St, Barangay X, City Y, Province Z, 1234
     - Contact Number: +63-2-1234-5678
     - Business Email: abc@trading.com (optional)
     - BIR Reg Number: (optional)
   
   - **Owner Section:**
     - Full Name: John Doe
     - Personal TIN: 123-456-789-012
3. Check the certification checkbox
4. Click "Submit Registration"

### Step 5: Check Status
- You should see: "⏳ Pending Approval - Your business registration is awaiting admin approval"
- Form should be hidden
- You can logout and login again - status persists

### Step 6: Admin Approval
1. Go to **Admin Login** (`admin-login.html`)
   - Note: Default admin setup might need manual login configuration
   - For testing, you can modify `admin-login.html` to accept any credentials

2. In Admin Dashboard:
   - You'll see your business listed under "Registered Businesses"
   - Shows: Business Name, Owner, TIN, Address, Contact, Status
   - Click **"Approve"** button

### Step 7: Access Restored
1. Logout and login as user
2. Go to Dashboard
3. All tools should now be:
   - ✓ Normal opacity (100%)
   - ✓ Clickable (pointer-events: auto)
   - ✓ No lock overlay
4. Click "Form Simulation" → Select a form
5. Taxpayer Name field should be pre-filled with "John Doe" (owner name)

---

## Admin Setup (Optional)

The admin dashboard currently has a simple login. To configure proper admin authentication:

**File**: `admin-login.html`

Current implementation accepts hardcoded credentials. To enhance:

1. Create an admin user table in Prisma
2. Add authentication endpoint
3. Verify admin role before allowing `/admin` endpoints

For now, you can manually set `localStorage.setItem('admin', '1')` in browser console to test.

---

## Verification Checklist

✅ User signup creates account  
✅ Login redirects to dashboard  
✅ Dashboard shows locked tools for new users  
✅ Registration form accepts all BIR fields  
✅ Business registration changes to PENDING  
✅ Admin can see business in admin dashboard  
✅ Admin can approve/reject business  
✅ After approval, user can access all tools  
✅ Forms auto-fill owner name  
✅ Unique TIN constraint prevents duplicates  

---

## Troubleshooting

### Issue: Page redirects to login after signup
**Solution**: Check that `localStorage.setItem('user', JSON.stringify(result.user))` is called after successful login

### Issue: Business not showing in admin dashboard
**Solution**: Verify database migration ran successfully with `npx prisma db push`

### Issue: Tools remain locked after approval
**Solution**: 
- Clear browser cache/localStorage: `localStorage.clear()`
- Logout and login again
- Verify database has correct status with: `npx prisma studio`

### Issue: Business TIN shows duplicate error
**Solution**: Each business must have unique TIN; update TIN value in registration form

---

## Key Endpoints Reference

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/signup` | User registration |
| POST | `/login` | User login |
| POST | `/business/register` | Register business |
| GET | `/business/approved/{userId}` | Check if user has approved business |
| GET | `/businesses?ownerId={id}` | List user's businesses |
| PATCH | `/business/{id}` | Admin approve/reject |
| GET | `/admin/businesses` | List all businesses for admin |

---

## Next Steps

After implementation is verified:

1. **Email Notifications**: Add nodemailer to send approval/rejection emails
2. **Document Storage**: Integrate cloud storage for BIR certificates and IDs
3. **Payment Integration**: Connect to actual payment gateway for "Pay Now"
4. **Receipt Generation**: Create PDF receipts with business details auto-filled
5. **Audit Trail**: Log all admin approvals with timestamp and reason

