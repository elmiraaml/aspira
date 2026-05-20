const express = require("express");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

const {
  createReport,
  uploadImage,
  getReports,
  getReportById,
  updateReport,
  deleteReport,
  getCategories,
  getMyReports,
} = require("../controllers/reportController");

const {
  verifyToken,
} = require("../middleware/authMiddleware");


// GET CATEGORIES
router.get("/categories", getCategories);

// GET MY REPORTS
router.get("/my", verifyToken, getMyReports);

// CREATE
router.post(
  "/",
  verifyToken,
  createReport
);

// GET ALL
router.get(
  "/",
  getReports
);

// GET DETAIL
router.get(
  "/:id",
  getReportById
);

// UPDATE
router.put(
  "/:id",
  verifyToken,
  updateReport
);

// DELETE
router.delete(
  "/:id",
  verifyToken,
  deleteReport
);

router.post(
  "/upload",
  verifyToken,
  upload.single("image"),
  uploadImage
);

module.exports = router;