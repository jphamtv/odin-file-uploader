// backend/app.js
const express = require('express');
const session = require('express-session');
const multer = require('multer');
const { PrismaSessionStore } = require('@quixo3/prisma-session-store');
const { PrismaClient } = require('@prisma/client');
const path = require('path');
const passport = require('passport');
const cors = require('cors');
const initializePassport = require('./auth/passportConfig');
const authRouter = require('./routes/auth');
const filesRouter = require('./routes/files');
const foldersRouter = require('./routes/folders');
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

// Routes
app.use('/auth', authRouter);
app.use('api/files', filesRouter);
app.use('api/folders', foldersRouter);

// Test protected route
app.get('/api/protected', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  res.json({ message: 'You have access to this protected route' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server ready at: http://localhost:3000`);
});
