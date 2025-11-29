# Business Registration and Approval Workflow - Implementation Summary

## Overview
This implementation adds a mandatory business registration and approval workflow to the BIR eServices platform. First-time users must register a business and wait for admin approval before accessing any tools (Form Simulations, Payments, Transactions).

---

## Key Features Implemented

### 1. **Database Schema Updates** (`prisma/schema.prisma`)
- **User Model**: Added `businessApprovalStatus` field to track approval state (NONE, PENDING, APPROVED, REJECTED)
- **Business Model**: Enhanced with mandatory BIR fields:
  - `businessName`, `businessTin` (unique)
  - `ownerName`, `ownerTin` (unique)
  - `businessType` (Sole Proprietorship, Partnership, Corporation, etc.)
  - `businessAddress`, `businessContact`, `businessEmail`
  - `businessRegNum` (optional BIR registration number)
  - `status` enum (PENDING, APPROVED, REJECTED)

### 2. **Backend Endpoints** (`server.js`)

#### Business Registration
- **POST `/business/register`**: Register a new business with all BIR-required fields
  - Updates user's `businessApprovalStatus` to PENDING
  - Validates required fields: businessName, businessTin, ownerName, ownerTin, ownerId
  - Prevents duplicate TINs

#### Business Approval Check
- **GET `/business/approved/:ownerId`**: Check if user has an approved business
  - Returns: `{ hasApprovedBusiness: boolean, business: {...} }`
  - Used to guard access to all tools

#### Business Management
- **GET `/businesses?ownerId={id}`**: List all businesses for a user
- **GET `/business/:id`**: Get specific business details
- **PATCH `/business/:id`**: Update business status (admin only)
  - Automatically updates user's `businessApprovalStatus` when approved/rejected

### 3. **User Interfaces**

#### Business Registration Form (`register-business.html`)
- Comprehensive form with two sections:
  - **Business Information**: Name, TIN, Type, Address, Contact, Email, Registration Number
  - **Owner Information**: Full Name, Personal TIN
- Shows real-time status messages:
  - ⏳ PENDING: Shows while waiting for admin approval
  - ✓ APPROVED: Shows success and redirects to dashboard
  - ✗ REJECTED: Allows user to re-submit
- Checkbox for certification of accuracy
- Styled sections with visual hierarchy

#### Dashboard (`dashboard.html`)
- Checks user's business approval status on load
- **Locked Tools**: Form Simulation, Payments, Transactions
  - Display 50% opacity with "🔒 Register a business first to unlock this tool" overlay
  - Prevents clicks (pointer-events: none)
- **Available Tool**: Register a Business (always accessible for first-time users)

#### Form Pages (`form-1701q.html`, `form-2551q.html`)
- Added approval guard:
  - Checks if user has approved business on page load
  - Redirects to business registration if not approved
- Auto-fills "Taxpayer Name" field with business owner's name from approved business

#### Payment & Transaction Pages (`payments.html`, `transactions.html`)
- Added approval guard
- Prevents access until user has approved business

#### Admin Dashboard (`admin-dashboard.html`)
- Enhanced business display with detailed information:
  - Business Name, Type, Address, Contact
  - Owner Name and Personal TIN
  - Business TIN
  - Current Status (color-coded badge)
- Approve/Reject buttons
- Disabled buttons based on current status

---

## User Flow

### First-Time User Journey
1. **Sign Up** → Create account with firstName, lastName, tin, email, password
2. **Login** → Redirected to dashboard
3. **Dashboard** → All tools locked except "Register a Business"
4. **Business Registration** → Fill out comprehensive business form
5. **Submission** → Business status: PENDING
6. **Waiting** → User sees pending status message on registration page
7. **Admin Approval** → Admin reviews and approves business
8. **Access Granted** → User can now access all tools
   - Business name and owner name auto-filled in forms
   - Full access to simulations, payments, transactions

### Approval Status States
- **NONE** (default): User just signed up, hasn't registered a business
- **PENDING**: User submitted business registration, awaiting admin review
- **APPROVED**: Admin approved business, user has full access
- **REJECTED**: Admin rejected business, user can re-submit with corrections

---

## Access Control Logic

### Protected Routes/Pages
All form pages check:
```javascript
GET /business/approved/{userId}
// If hasApprovedBusiness === false:
//   → Redirect to register-business.html
//   → Show alert: "You must register and have an approved business first"
```

### Dashboard Lock Mechanism
```javascript
// Locks all tool cards except "Register a Business"
// Shows overlay on locked cards with 🔒 icon
// Disables click events with pointer-events: none
```

---

## Field Requirements

### Mandatory Business Fields (BIR Compliant)
- **Business Name**: Required, as registered with BIR
- **Business TIN**: Required, unique, format: XXX-XXX-XXX-XXX
- **Business Type**: Required, dropdown with options
- **Business Address**: Required, full address details
- **Business Contact**: Required, phone number
- **Owner Name**: Required, full name as in government ID
- **Owner Personal TIN**: Required, unique, format: XXX-XXX-XXX-XXX

### Optional Fields
- Business Email
- BIR Registration Number (if already registered)

---

## Auto-Fill Functionality

When a business is approved, the following fields are automatically populated in forms:
- **Taxpayer Name**: Filled with `business.ownerName`
- **Business Name**: Available for display in receipts and invoices
- **Business TIN**: Available for document generation

---

## Database Migration

Run migration to update schema:
```bash
cd BIRrevamped
npx prisma migrate deploy
# Or create migration for pending changes:
npx prisma migrate dev --name add_business_approval_workflow
```

---

## Error Handling

### Validation Errors
- Missing required fields: 400 Bad Request
- Duplicate TIN: 409 Conflict (with message about existing TIN)
- User not found: 404 Not Found
- Server errors: 500 Server Error

### User-Facing Alerts
- Clear messages on registration success/failure
- Notification when awaiting approval
- Instructions to contact admin if rejected

---

## Security Considerations

1. **Unique Constraints**: Business TIN and Owner TIN are unique to prevent duplicates
2. **User Ownership**: Businesses are tied to specific user (ownerId)
3. **Status-Based Access**: Tools check actual database status, not client-side flags
4. **Admin-Only Actions**: Approval/rejection can only be done through admin endpoints

---

## Future Enhancements

1. **Email Notifications**: Send approval/rejection emails to users
2. **Bulk Import**: Admin tool to import existing registered businesses
3. **Edit Business Details**: Allow users to update business info (pending re-approval)
4. **Search/Filter**: Admin dashboard to filter businesses by status
5. **Audit Logs**: Track all approval/rejection actions with timestamps
6. **Document Upload**: Require supporting documents (BIR cert, ID, etc.)

---

## Testing Checklist

- [ ] Sign up new user
- [ ] Login and verify dashboard shows locked tools
- [ ] Submit business registration form
- [ ] Verify registration shows PENDING status
- [ ] Login as admin and approve business
- [ ] Verify user can now access all tools
- [ ] Verify forms auto-fill owner name
- [ ] Test rejection and re-submission flow
- [ ] Verify unique TIN constraint prevents duplicates
- [ ] Test redirect from forms when not approved

---

## Files Modified/Created

### Modified
- `prisma/schema.prisma` - Added user approval status and business fields
- `server.js` - Added business endpoints and approval logic
- `dashboard.html` - Added lock mechanism and approval check
- `form-1701q.html` - Added approval guard and auto-fill
- `form-2551q.html` - Added approval guard and auto-fill
- `payments.html` - Added approval guard
- `transactions.html` - Added approval guard
- `admin-dashboard.html` - Enhanced business display

### Created
- `register-business.html` - Comprehensive business registration form
- `prisma/migrations/20251117_add_business_approval_workflow/migration.sql` - Database migration

---

## Technical Stack

- **Frontend**: HTML, CSS, JavaScript (vanilla)
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: Basic session via localStorage (user object)

