const express = require("express");
const router = express.Router();
const { getCommentsByReportId, addComment } = require("../controllers/commentController");
const { verifyToken } = require("../middleware/authMiddleware");

// GET all comments for a report
router.get("/report/:reportId", getCommentsByReportId);

// POST a new comment to a report
router.post("/report/:reportId", verifyToken, addComment);

module.exports = router;