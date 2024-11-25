// backend/app.js
const express = require('express');
const session = require('express-session');
const multer = require('multer');
const { PrismaSessionStore } = require('@quixo3/prisma-session-store');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();
const path = require('path');
const passport = require('passport');
const cors = require('cors');
const initializePassport = require('./auth/passportConfig');
require('dotenv').config();

// Configure Multer storage
const upload = multer({ dest: './uploads' });

const app = express();

// Basic middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: false })); // Get values from req.body

// Static files
const assetsPath = path.join(__dirname, 'public');
app.use(express.static(assetsPath));

// Session middleware config (MUST come before passport middleware)
app.use(session({
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000 // ms
  },
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: new PrismaSessionStore(
    new PrismaClient(),
    {
      checkPeriod: 2 * 60 * 1000, // ms
      dbRecordIdIsSessionId: true,
      dbRecordIdFunction: undefined,
    }
  )
}));

// Initialize Passport + middleware
initializePassport();
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

// Basic CORS setup
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL
    : 'http://localhost:5173',
  credentials: true
};
app.use(cors(corsOptions));

// TESTING ONLY ******

// Minimal routes for testing auth
app.post('/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword
      }
    });

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Error registering user' });
  }
});

app.post('/auth/login', passport.authenticate('local'), (req, res) => {
  res.json({ message: 'Logged in successfully' });
});

app.post('/auth/logout', (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ message: 'Error logging out' });
    res.json({ message: 'Logged out successfully' });
  });
});

// Test protected route
app.get('/api/protected', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  res.json({ message: 'You have access to this protected route' });
});

// Test file upload
app.post('/api/files/upload', upload.single('file'), async (req, res) => {
  try {
    // req.file contains info about uploaded file
    // Save metadata to database
    const fileData = await prisma.file.create({
      data: {
        name: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype,
        url: req.file.path,
        userId: req.user.id
      }
    });

    res.json(fileData);
    console.log(req.file, req.body)
  } catch (error) {
    console.error('Upload error', error);
    res.status(500).json({ message: 'Error uploading file' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server ready at: http://localhost:3000`);
});
