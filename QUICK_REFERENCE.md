# Quick Reference Card

## 🚀 Quick Start (5 Minutes)

```bash
# 1. Update Database
cd c:\Users\jhale\Documents\Codes\BIRrevamped
npx prisma migrate deploy

# 2. Start Server
node server.js

# 3. Open Browser
http://localhost:3000
```

---

## 📋 Required Business Information

When users register a business, they must provide:

| Field | Format | Example | Required |
|-------|--------|---------|----------|
| Business Name | Text | ABC Trading Company | ✅ Yes |
| Business TIN | XXX-XXX-XXX-XXX | 123-456-789-012 | ✅ Yes |
| Business Type | Dropdown | Sole Proprietorship | ✅ Yes |
| Business Address | Full Address | 123 Main St, Barangay X, City Y | ✅ Yes |
| Business Contact | Phone | +63-2-1234-5678 | ✅ Yes |
| Owner Full Name | Text | John Doe | ✅ Yes |
| Owner TIN | XXX-XXX-XXX-XXX | 123-456-789-000 | ✅ Yes |
| Business Email | Email | info@abc.com | ❌ Optional |
| BIR Reg Number | Text | 2024-123456 | ❌ Optional |

---

## 🔐 Access Control States

```
USER STATE          DASHBOARD STATUS              FORMS ACCESS
─────────────────────────────────────────────────────────────
NONE                ✅ Register Business          🔒 ALL LOCKED
(New User)          🔒 All Tools Locked
                    
PENDING             ✅ Register Business          🔒 ALL LOCKED
(Awaiting Approval) ⏳ Status: Pending
                    
APPROVED            ✅ Register Business          ✅ ALL UNLOCKED
(Ready to Use)      ✅ All Tools Unlocked         Auto-fill: Owner Name
                    
REJECTED            ✅ Register Business          🔒 ALL LOCKED
(Needs Resubmit)    ❌ Status: Rejected           Can re-submit
```

---

## 🔄 Approval Workflow

```
USER SUBMITS
    ↓
DATABASE: status = "PENDING"
DATABASE: user.businessApprovalStatus = "PENDING"
    ↓
ADMIN LOGS IN
    ↓
ADMIN DASHBOARD: Reviews business details
    ↓
ADMIN CLICKS "APPROVE" or "REJECT"
    ↓
DATABASE UPDATES: status = "APPROVED"|"REJECTED"
DATABASE UPDATES: user.businessApprovalStatus = "APPROVED"|"REJECTED"
    ↓
NEXT TIME USER LOGS IN:
    ├─ If APPROVED → Full access to all tools ✅
    └─ If REJECTED → Can retry registration ⚠️
```

---

## 📊 Database Changes

### New User Fields
```sql
ALTER TABLE "User" ADD COLUMN "businessApprovalStatus" TEXT DEFAULT 'NONE';
-- Values: NONE | PENDING | APPROVED | REJECTED
```

### New Business Fields
```sql
-- Renamed Fields (to BIR naming convention)
name → businessName
tin → businessTin
type → businessType
address → businessAddress
contact → businessContact

-- New Fields
ownerName         -- Full name of business owner
ownerTin          -- Personal TIN of owner
businessEmail     -- Optional email
businessRegNum    -- Optional BIR registration number
```

### Unique Constraints
```sql
UNIQUE "businessTin"  -- Each business has unique TIN
UNIQUE "ownerTin"     -- Each owner's TIN is unique
```

---

## 🌐 API Endpoints

### Business Registration
```
POST /business/register
Content-Type: application/json

{
  "businessName": "ABC Trading",
  "businessTin": "123-456-789-012",
  "ownerName": "John Doe",
  "ownerTin": "123-456-789-000",
  "businessType": "Sole Proprietorship",
  "businessAddress": "123 Main St, City, Province, 1234",
  "businessContact": "+63-2-1234-5678",
  "businessEmail": "info@abc.com",
  "businessRegNum": "2024-123456",
  "ownerId": "user-uuid-here"
}

RESPONSES:
✅ 201 Created - Registration successful
⚠️ 409 Conflict - TIN already exists
❌ 400 Bad Request - Missing required fields
```

### Check Approval Status
```
GET /business/approved/{userId}

RESPONSE:
{
  "hasApprovedBusiness": true|false,
  "business": {
    "id": "...",
    "businessName": "ABC Trading",
    "ownerName": "John Doe",
    "status": "APPROVED",
    ...
  } or null
}
```

### Admin Approve/Reject
```
PATCH /business/{businessId}
Content-Type: application/json

{
  "status": "APPROVED"
}
or
{
  "status": "REJECTED"
}

RESPONSE:
✅ 200 OK - Status updated
❌ 404 Not Found - Business not found
```

---

## 🎯 Testing Quick Commands

```javascript
// In Browser Console

// 1. Check current user
localStorage.getItem('user')

// 2. Clear and logout
localStorage.clear()

// 3. Check admin status
localStorage.getItem('admin')

// 4. Set admin for testing
localStorage.setItem('admin', '1')

// 5. Check all registered businesses
fetch('http://localhost:3000/admin/businesses')
  .then(r => r.json())
  .then(d => console.log(d))
```

---

## ✅ Verification Checklist

### User Registration
- [ ] Signup creates user with tin, email, firstName, lastName
- [ ] Login stores user in localStorage
- [ ] Dashboard appears after login

### Business Registration
- [ ] All form fields render correctly
- [ ] Required field validation works
- [ ] Checkbox certification is required
- [ ] Submit creates business with status PENDING
- [ ] Page shows "Pending Approval" message

### Access Control
- [ ] New users see locked tools on dashboard
- [ ] Forms redirect to register-business if not approved
- [ ] Payment/Transactions pages redirect if not approved
- [ ] Lock overlay shows 🔒 icon on dashboard

### Admin Approval
- [ ] Admin dashboard shows all businesses
- [ ] Business details display correctly (name, TIN, owner, address)
- [ ] Approve button updates status to APPROVED
- [ ] Reject button updates status to REJECTED

### User Access After Approval
- [ ] Dashboard shows unlocked tools
- [ ] Forms accessible without redirect
- [ ] Forms show auto-filled owner name
- [ ] Payments/Transactions accessible

### Error Handling
- [ ] Duplicate TIN shows error message
- [ ] Missing fields show validation error
- [ ] 404 errors handled gracefully
- [ ] 500 errors show user-friendly message

---

## 🔒 Security Notes

⚠️ **Important**: The current implementation uses localStorage for auth.
   For production, implement:
   - JWT tokens with expiration
   - Secure HTTP-only cookies
   - Server-side session management
   - HTTPS only
   - CORS restrictions

✅ **Current implementation includes**:
   - Unique constraints on TINs
   - User ownership validation
   - Server-side status checks
   - Field validation

---

## 📱 Page URLs

| Page | URL | State |
|------|-----|-------|
| Home | / | Public |
| Signup | /signup.html | Public |
| Login | /login.html | Public |
| Admin Login | /admin-login.html | Admin |
| Dashboard | /dashboard.html | Authenticated |
| Register Business | /register-business.html | Authenticated |
| Form 1701Q | /form-1701q.html | Authenticated + Approved |
| Form 2551Q | /form-2551q.html | Authenticated + Approved |
| Payments | /payments.html | Authenticated + Approved |
| Transactions | /transactions.html | Authenticated + Approved |
| Admin Dashboard | /admin-dashboard.html | Admin |

---

## 💡 Pro Tips

1. **Testing with multiple users**
   - Open in incognito window to test with different users
   - Each gets separate localStorage

2. **Check database directly**
   - `npx prisma studio` to view database GUI
   - Search for user or business by ID

3. **Reset for fresh test**
   - Delete records from Prisma Studio
   - Or: `npx prisma db reset` (⚠️ WARNING: Deletes all data)

4. **Debug approval status**
   - Go to register-business.html page
   - Check Network tab → GET /business/approved/{userId}
   - Inspect Response to see approval status

5. **Monitor server logs**
   - Watch terminal where `node server.js` runs
   - Checkpoint logs show API calls and errors

---

## 🆘 Troubleshooting

| Problem | Solution |
|---------|----------|
| Page redirects to login | User not logged in - sign up first |
| Tools stay locked | Clear cache: `localStorage.clear()` then re-login |
| Form shows duplicate TIN error | Check if TIN already exists in database |
| Admin doesn't see businesses | Verify migration ran: `npx prisma migrate deploy` |
| Auto-fill not working | Verify business status is "APPROVED" in database |
| Can't approve business | Check admin localStorage: `localStorage.setItem('admin', '1')` |

---

## 📞 Key Contacts/Resources

- **Prisma Studio**: `npx prisma studio` (View database)
- **Server**: `node server.js` (Start backend)
- **Browser DevTools**: F12 (Debug frontend)
- **Database Migrations**: `npx prisma migrate dev`

---

## 📄 Related Documentation

1. **SUMMARY.md** ← Start here for overview
2. **IMPLEMENTATION_GUIDE.md** ← Step-by-step setup
3. **BUSINESS_REGISTRATION_WORKFLOW.md** ← Technical details
4. **WORKFLOW_VISUAL_GUIDE.md** ← Visual flowcharts
5. **QUICK_REFERENCE.md** ← This file

---

**Version**: 1.0 | **Date**: November 17, 2025 | **Status**: ✅ Ready for Testing

