require('dotenv').config(); // <-- add this line at top

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();
const saltRounds = 10;

// Configure CORS to allow all origins (safe for demo/testing)
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Serve static files from the current directory

app.post('/signup', async (req, res) => {
    console.log("'/signup' endpoint hit."); // Checkpoint A: Did the request reach the server?

    const { firstName, lastName, tin, email, password } = req.body;
    console.log("Received data:", req.body); // Checkpoint B: What data did the server receive?

    if (!firstName || !lastName || !tin || !email || !password) {
        console.log("Validation failed: Missing fields."); // Checkpoint C: Did validation fail?
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        console.log("Password hashed successfully."); // Checkpoint D: Did hashing work?

        const newUser = await prisma.user.create({
            data: {
                firstName,
                lastName,
                tin,
                email,
                passwordHash: hashedPassword,
            },
        });

        console.log("User created in database:", newUser); // Checkpoint E: Was the user saved?
        res.status(201).json({ message: 'User created successfully!', user: newUser });

    } catch (error) {
        console.error("Error during user creation:", error); // Checkpoint F: Did Prisma or Bcrypt throw an error?
        if (error.code === 'P2002') { // Prisma's unique constraint violation code
            return res.status(409).json({ message: 'A user with this email or TIN already exists.' });
        }
        res.status(500).json({ message: 'An error occurred on the server.' });
    }
});

// Login route
app.post('/login', async (req, res) => {
    console.log("'/login' endpoint hit.");
    const { email, password } = req.body;
    console.log('Login payload:', req.body);

    if (!email || !password) {
        console.log('Login validation failed: missing email or password');
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            console.log('Login failed: user not found for', email);
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const match = await bcrypt.compare(password, user.passwordHash);
        if (!match) {
            console.log('Login failed: invalid password for', email);
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        // Return minimal user info only
        const safeUser = { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName };
        console.log('Login successful for', email);
        return res.status(200).json({ message: 'Login successful!', user: safeUser });

    } catch (error) {
        console.error('Error during login:', error);
        return res.status(500).json({ message: 'An error occurred on the server.' });
    }
});

// --- Business endpoints ---
app.post('/business/register', async (req, res) => {
  console.log("'/business/register' endpoint hit.", req.body);

  const body = req.body || {};
  
  // Common
  const registrationType = body.registrationType || "INDIVIDUAL";
  const businessName = body.businessName;
  const businessTin = body.businessTin;
  const businessAddress = body.businessAddress;
  const businessEmail = body.businessEmail;
  const businessContact = body.businessContact;
  const lineOfBusiness = body.lineOfBusiness;
  const ownerId = body.ownerId;

  // Individual
  const ownerName = body.ownerName;
  const ownerTin = body.ownerTin;
  const civilStatus = body.civilStatus;
  const citizenship = body.citizenship;
  const dateOfBirth = body.dateOfBirth ? new Date(body.dateOfBirth) : null;

  // Non-Individual
  const organizationType = body.organizationType;
  const secRegNum = body.secRegNum;
  const dateOfRegistration = body.dateOfRegistration ? new Date(body.dateOfRegistration) : null;
  const authorizedRep = body.authorizedRep;

  // Validation
  const missing = [];
  if (!businessName) missing.push('businessName');
  if (!businessTin) missing.push('businessTin');
  if (!ownerId) missing.push('ownerId');

  if (registrationType === 'INDIVIDUAL') {
      if (!ownerName) missing.push('ownerName');
      if (!ownerTin) missing.push('ownerTin');
  } else {
      if (!authorizedRep) missing.push('authorizedRep');
      if (!organizationType) missing.push('organizationType');
  }

  if (missing.length) {
    console.warn('/business/register validation failed - missing:', missing.join(', '));
    return res.status(400).json({ message: `Missing required fields: ${missing.join(', ')}` });
  }

  try {
    const owner = await prisma.user.findUnique({ where: { id: ownerId } });
    if (!owner) {
      return res.status(404).json({ message: 'Owner user not found' });
    }

    const business = await prisma.business.create({
      data: {
        registrationType,
        businessName,
        businessTin,
        businessAddress,
        businessEmail,
        businessContact,
        lineOfBusiness,
        ownerName,
        ownerTin,
        civilStatus,
        citizenship,
        dateOfBirth,
        organizationType,
        secRegNum,
        dateOfRegistration,
        authorizedRep,
        ownerId,
        status: 'PENDING'
      },
    });

    // Update user's approval status to PENDING (safe guard)
    try {
      await prisma.user.update({ where: { id: ownerId }, data: { businessApprovalStatus: 'PENDING' } });
    } catch (uErr) {
      console.warn('Failed to update user approval status after business create:', uErr.message || uErr);
    }

    res.status(201).json({ message: 'Business registered and awaiting admin approval', business });
  } catch (error) {
    console.error('Error registering business:', error);
    if (error.code === 'P2002') {
      return res.status(409).json({ message: 'A business with this TIN already exists.' });
    }
    res.status(500).json({ message: 'Server error', details: error.message });
  }
});

app.get('/businesses', async (req, res) => {
  const ownerId = req.query.ownerId;
  if (!ownerId) return res.status(400).json({ message: 'ownerId query required' });

  try {
    const list = await prisma.business.findMany({ where: { ownerId }, orderBy: { createdAt: 'desc' } });
    res.json({ businesses: list });
  } catch (error) {
    console.error('Error fetching businesses:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/business/approved/:ownerId', async (req, res) => {
  const ownerId = req.params.ownerId;
  if (!ownerId) return res.status(400).json({ message: 'ownerId required' });

  try {
    const approved = await prisma.business.findFirst({
      where: { ownerId, status: 'APPROVED' }
    });
    res.json({ 
      hasApprovedBusiness: !!approved,
      business: approved || null
    });
  } catch (error) {
    console.error('Error checking business approval:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/business/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const biz = await prisma.business.findUnique({ where: { id }, include: { owner: true } });
    if (!biz) return res.status(404).json({ message: 'Business not found' });
    res.json({ business: biz });
  } catch (error) {
    console.error('Error fetching business:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.patch('/business/:id', async (req, res) => {
  const id = req.params.id;
  const updates = {};
  // allow updating status and some basic fields
  const { status, businessName, businessAddress, businessContact, businessType } = req.body;
  if (status) updates.status = status;
  if (businessName) updates.businessName = businessName;
  if (businessAddress) updates.businessAddress = businessAddress;
  if (businessContact) updates.businessContact = businessContact;
  if (businessType) updates.businessType = businessType;

  try {
    const updated = await prisma.business.update({ where: { id }, data: updates });
    
    // If status changed to APPROVED, update user's approval status
    if (status === 'APPROVED') {
      await prisma.user.update({
        where: { id: updated.ownerId },
        data: { businessApprovalStatus: 'APPROVED' }
      });
    }
    
    if (status === 'REJECTED') {
      await prisma.user.update({
        where: { id: updated.ownerId },
        data: { businessApprovalStatus: 'REJECTED' }
      });
    }

    res.json({ business: updated });
  } catch (error) {
    console.error('Error updating business:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// --- Admin endpoints (no auth yet) ---
app.get('/admin/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    // return safe fields only
    const safe = users.map(u => ({ id: u.id, firstName: u.firstName, lastName: u.lastName, email: u.email, tin: u.tin, createdAt: u.createdAt }));
    res.json({ users: safe });
  } catch (error) {
    console.error('Error fetching users for admin:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/admin/businesses', async (req, res) => {
  try {
    const businesses = await prisma.business.findMany({ include: { owner: true }, orderBy: { createdAt: 'desc' } });
    res.json({ businesses });
  } catch (error) {
    console.error('Error fetching businesses for admin:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// delete user and related data
app.delete('/admin/user/:id', async (req, res) => {
  const id = req.params.id;
  try {
    // delete dependent records first
    await prisma.business.deleteMany({ where: { ownerId: id } });
    await prisma.submission.deleteMany({ where: { userId: id } });
    const deleted = await prisma.user.delete({ where: { id } });
    res.json({ message: 'User and related data deleted', user: { id: deleted.id } });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// --- Simulations API ---
app.post('/api/simulations', async (req, res) => {
  try {
    const { title, form, data, amount, userId, businessId } = req.body;
    if (!form || typeof amount !== 'number' || !userId) {
      return res.status(400).json({ message: 'form, amount (number) and userId required' });
    }
    const sim = await prisma.simulation.create({
      data: {
        title,
        form,
        data,
        amount,
        userId,
        businessId,
      },
    });
    res.status(201).json(sim);
  } catch (err) {
    console.error('Error creating simulation:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/simulations', async (req, res) => {
  try {
    const where = {};
    if (req.query.userId) where.userId = req.query.userId;
    const sims = await prisma.simulation.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    res.json(sims);
  } catch (err) {
    console.error('Error fetching simulations:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.patch('/api/simulations/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const updates = req.body;
    const updated = await prisma.simulation.update({
      where: { id },
      data: updates,
    });
    res.json(updated);
  } catch (err) {
    console.error('Error updating simulation:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// --- Transactions API ---
app.post('/api/transactions', async (req, res) => {
  try {
    const { userId, items, total } = req.body;
    if (!Array.isArray(items) || typeof total !== 'number') {
      return res.status(400).json({ message: 'items (array) and total (number) required' });
    }

    const tx = await prisma.transaction.create({
      data: {
        total,
        userId,
        items: {
          create: items.map(i => ({
            description: i.description,
            amount: i.amount,
            simulationId: i.simulationId || null,
          })),
        },
      },
      include: { items: true },
    });

    // mark simulations paid if present
    const simIds = items.map(i => i.simulationId).filter(Boolean);
    if (simIds.length) {
      await prisma.simulation.updateMany({ where: { id: { in: simIds } }, data: { paid: true } });
    }

    res.status(201).json(tx);
  } catch (err) {
    console.error('Error creating transaction:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/transactions', async (req, res) => {
  try {
    const where = {};
    if (req.query.userId) where.userId = req.query.userId;
    const txs = await prisma.transaction.findMany({
      where,
      orderBy: { date: 'desc' },
      include: { items: true },
    });
    res.json(txs);
  } catch (err) {
    console.error('Error fetching transactions:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
