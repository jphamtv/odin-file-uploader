// backend/routes/user.js
const express = require("express");
const router = express.Router();
const passport = require("passport");
const { registerUser } = require("../controllers/userController");

// Middleware
function checkAuth(req, res, next) {
  if (req.isAuthenticated()) {
    return res.status(403).json({ message: "Already authenticated" });
  }
  next();
}

// Check authentication status
router.get("/auth/status", (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ authenticated: false });
  }
  res.json({
    authenticated: true,
    user: { id: req.user.id, email: req.user.email },
  });
});

// Public routes
router.post("/register", checkAuth, async (req, res, next) => {
  try {
    await registerUser(req, res);
  } catch (error) {
    next(error);
  }
});

router.post("/login", checkAuth, (req, res, next) => {
  passport.authenticate("local", (error, user, info) => {
    if (error) {
      return res.status(500).json({ message: "Authentication error" });
    }
    if (!user) {
      return res
        .status(401)
        .json({ message: info.message || "Invalid credentials" });
    }
    req.logIn(user, (error) => {
      if (error) {
        return res.status(500).json({ message: "Error logging in" });
      }
      return res.json({
        message: "Logged in successfully",
        user: { id: user.id, email: user.email },
      });
    });
  })(req, res, next);
});

// Protected routes
router.get("/logout", (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  req.logout((error) => {
    if (error) {
      return res.status(500).json({ message: "Error logging out" });
    }
    res.json({ message: "Logged out successfully" });
  });
});

module.exports = router;
