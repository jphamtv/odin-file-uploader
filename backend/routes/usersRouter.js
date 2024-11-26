// backend/routes/user.js
const express = require('express');
const router = express.Router();

// Middleware
function redirectIfAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }
  next();
}

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

// Public routes
router.post('/register', redirectIfAuthenticated, registerUser);
router.post('/login', passport.authenticate('local'), {
  successRedirect: '/',
  failureRedirect: '/login'
});

// Protected routes
router.get('/logout', ensureAuthenticated, (req, res, next) => {
  req.logout((error) => {
    if (error) return res.status(500).json({ message: 'Error logging out' });
    res.json({ message: 'Logged out successfully' });
  });
});


module.exports = router;
