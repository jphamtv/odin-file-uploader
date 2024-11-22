// backend/app.ts
// const express = require('express');
// const session = require('express-session');
// const path = require('node:path');
// const passport = require('passport');
// const cors = require('cors');
// const initializePassport = require('./auth/passportConfig');

import express from 'express';
import session from 'express-session';
import { PrismaSessionStore } from '@quixo3/prisma-session-store';
import { PrismaClient } from '@prisma/client';
import path from 'node:path';
import passport from 'passport';
import cors from 'cors';
import initializePassport from './auth/passportConfig';
import { config } from 'dotenv';
config();

const app = express();

// API Health check - REMOVE LATER
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Enable static assets and look for assets in the 'public' directory
const assetsPath = path.join(__dirname, 'public');
app.use(express.static(assetsPath));

// Parses form payloads and sets it to the 'req.body'
app.use(express.urlencoded({ extended: false }));

// Session middleware (MUST come before passport middleware)
app.use(session({
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000 // ms
  }
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  store: new PrismaSessionStore(
    new PrismaClient(),
    {
      checkPeriod: 2 * 60 * 1000, // ms
      dbRecordIdIsSessionId: true,
      dbRecordIdFunction: undefined,
    }
  )
}));

// Initialize Passport
initializePassport();

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

// Middleware
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL
    : 'http://localhost:5173',
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());

// Routes placeholder

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server ready at: http://localhost:3000`);
});
