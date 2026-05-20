exports.isAdmin = (req, res, next) => {
  try {

    if (req.user.role !== "admin" && req.user.role !== "superadmin") {
      return res.status(403).json({
        message: "Akses admin ditolak",
      });
    }

    next();

  } catch (error) {
    return res.status(500).json({
      message: error.message || "Server error",
    });
  }
};