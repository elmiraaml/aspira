const express = require("express");

const router = express.Router();

const {
  getDashboardStats,
  getUsers,
  getAdmins,
  createAdmin,
  deleteUser,
  updateReportStatus,
  getAuditLogs,
  getActivityLogs,
} = require("../controllers/adminController");

const {
  verifyToken,
} = require("../middleware/authMiddleware");

const {
  isAdmin,
} = require("../middleware/adminMiddleware");


// DASHBOARD
router.get(
  "/dashboard",
  verifyToken,
  isAdmin,
  getDashboardStats
);


// GET USERS
router.get(
  "/users",
  verifyToken,
  isAdmin,
  getUsers
);

router.delete(
  "/users/:id",
  verifyToken,
  isAdmin,
  deleteUser
);

// ADMINS
router.get(
  "/admins",
  verifyToken,
  isAdmin,
  getAdmins
);

router.post(
  "/admins",
  verifyToken,
  isAdmin,
  createAdmin
);

router.delete(
  "/admins/:id",
  verifyToken,
  isAdmin,
  deleteUser
);


// UPDATE STATUS
router.put(
  "/reports/:id/status",
  verifyToken,
  isAdmin,
  updateReportStatus
);

// LOGS
router.get("/audit-logs", verifyToken, isAdmin, getAuditLogs);
router.get("/activity-logs", verifyToken, isAdmin, getActivityLogs);

module.exports = router;