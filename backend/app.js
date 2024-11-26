// backend/app.js
const express = require('express');
const session = require('express-session');
const { PrismaSessionStore } = require('@quixo3/prisma-session-store');
const { PrismaClient } = require('@prisma/client');
const path = require('path');
const passport = require('passport');
const cors = require('cors');
const initializePassport = require('./auth/passportConfig');
const userRouter = require('./routes/usersRouter');
const filesRouter = require('./routes/filesRouter');
const foldersRouter = require('./routes/foldersRouter');
require('dotenv').config();

const app = express();

// Basic middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: false })); // Get values from req.body

// Static files
const assetsPath = path.join(__dirname, 'public');
app.use(express.static(assetsPath));

// Basic CORS setup
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL
    : 'http://localhost:5173',
  credentials: true
};
app.use(cors(corsOptions));

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

// Routes
const authenticateRoute = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  next();
};

app.use('/', userRouter);
app.use('/api/files', authenticateRoute, filesRouter);
// app.use('/api/folders', authenticateRoute, foldersRouter);

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
