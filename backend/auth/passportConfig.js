const bcrypt = require('bcryptjs');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const { PrismaClient } = require('@prisma/client');
const { getByEmail, getById } = require('../models/userModel');

const prisma = new PrismaClient();

function initialize() {
  // Configure strategy options to use email field
  const options = {
    usernameField: 'email',
    passwordField: 'password'
  };

  passport.use(
    new LocalStrategy(options, async (email, password, done) => {
      try {
        // Find user by email
        const user = await getByEmail(email);

        if (!user) {
          return done(null, false, { message: 'Incorrect email' });
        }

        // Check if password matches
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
          return done(null, false, { message: 'Incorrect password' });
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await getById(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
}

module.exports = initialize;
