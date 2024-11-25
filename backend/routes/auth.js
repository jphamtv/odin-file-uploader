// backend/routes/auth.js
const express = require('express');
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', passport.authenticate('local'), loginUser);
router.post('/logout', logoutUser);

module.exports = router;
