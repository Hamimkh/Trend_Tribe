const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const {
  createUser,
  loginUserCtrl,
  handleRefreshToken,
  loginAdminCtrl,
  logout,
  updateUser,
} = require("../Controller/userCtrl");
const router = express.Router();

// Authentication Routes
router.post("/signup", createUser);
router.post("/login", loginUserCtrl);
router.post("/admin-login", loginAdminCtrl);
router.get("/logout", logout);

// Token Related Routes
router.get("/refresh-token", handleRefreshToken);

// User Related Routes
router.put("/edit-user", authMiddleware, updateUser);

module.exports = router;
