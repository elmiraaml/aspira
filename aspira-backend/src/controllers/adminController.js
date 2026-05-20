const db = require("../config/db");


// DASHBOARD STATS
exports.getDashboardStats = async (req, res) => {
  try {

    // total laporan
    const [totalReports] = await db.query(
      "SELECT COUNT(*) AS total FROM reports"
    );

    // pending
    const [pendingReports] = await db.query(
      `
      SELECT COUNT(*) AS total
      FROM reports
      WHERE status = 'pending'
      `
    );

    // process
    const [processReports] = await db.query(
      `
      SELECT COUNT(*) AS total
      FROM reports
      WHERE status = 'diproses'
      `
    );

    // completed
    const [completedReports] = await db.query(
      `
      SELECT COUNT(*) AS total
      FROM reports
      WHERE status = 'selesai'
      `
    );

    // total users
    const [totalUsers] = await db.query(
      `
      SELECT COUNT(*) AS total
      FROM users
      WHERE role = 'user'
      `
    );

    // total admins
    const [totalAdmins] = await db.query(
      `
      SELECT COUNT(*) AS total
      FROM users
      WHERE role = 'admin'
      `
    );

    // today reports
    const [todayReports] = await db.query(
      `
      SELECT COUNT(*) AS total
      FROM reports
      WHERE DATE(created_at) = CURDATE()
      `
    );

    res.status(200).json({
      total_reports: totalReports[0].total,
      pending_reports: pendingReports[0].total,
      process_reports: processReports[0].total,
      completed_reports: completedReports[0].total,
      total_users: totalUsers[0].total,
      total_admins: totalAdmins[0].total,
      today_reports: todayReports[0].total,
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};


// GET ALL USERS
exports.getUsers = async (req, res) => {
  try {

    const [users] = await db.query(
      `
      SELECT
        id,
        fullname,
        email,
        role,
        created_at
      FROM users
      WHERE role = 'user'
      ORDER BY created_at DESC
      `
    );

    res.status(200).json(users);

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};


// UPDATE STATUS LAPORAN
exports.updateReportStatus = async (req, res) => {
  try {

    const { id } = req.params;
    const { status, notes } = req.body;

    const [old] = await db.query("SELECT status FROM reports WHERE id = ?", [id]);
    const oldStatus = old.length > 0 ? old[0].status : null;

    await db.query(
      `
      UPDATE reports
      SET status = ?
      WHERE id = ?
      `,
      [status, id]
    );

    if (req.user) {
      await db.query(
        "INSERT INTO audit_logs (report_id, old_status, new_status, changed_by, notes) VALUES (?, ?, ?, ?, ?)",
        [id, oldStatus, status, req.user.id, notes || null]
      );
    }

    res.status(200).json({
      message: "Status laporan berhasil diupdate",
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: error.message || "Server error",
    });
  }
};


// GET ALL ADMINS
exports.getAdmins = async (req, res) => {
  try {
    const [admins] = await db.query(
      `
      SELECT id, fullname as full_name, email, role, created_at
      FROM users
      WHERE role = 'admin'
      ORDER BY created_at DESC
      `
    );
    res.status(200).json(admins);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

// CREATE ADMIN
const bcrypt = require("bcryptjs");
exports.createAdmin = async (req, res) => {
  try {
    const { full_name, email, password } = req.body;
    
    // Check email
    const [existing] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (existing.length > 0) return res.status(400).json({ message: "Email sudah digunakan" });

    // Hash
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await db.query(
      "INSERT INTO users (fullname, email, password, role) VALUES (?, ?, ?, 'admin')",
      [full_name, email, hashedPassword]
    );

    if (req.user) {
      await db.query("INSERT INTO activity_logs (admin_id, action, description) VALUES (?, ?, ?)", [
        req.user.id,
        "CREATE_ADMIN",
        `Membuat admin baru: ${full_name}`
      ]);
    }

    res.status(201).json({ message: "Admin berhasil dibuat" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE USER / ADMIN
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // get user first for log
    const [u] = await db.query("SELECT * FROM users WHERE id = ?", [id]);
    const name = u.length > 0 ? u[0].fullname : "Unknown";

    await db.query("DELETE FROM users WHERE id = ?", [id]);

    if (req.user) {
      await db.query("INSERT INTO activity_logs (admin_id, action, description) VALUES (?, ?, ?)", [
        req.user.id,
        "DELETE_USER",
        `Menghapus user/admin ${name}`
      ]);
    }

    res.status(200).json({ message: "Berhasil dihapus" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET AUDIT LOGS
exports.getAuditLogs = async (req, res) => {
  try {
    const [logs] = await db.query(`
      SELECT a.*, r.title as report_title, u.fullname as changed_by_name, u.role as changer_role
      FROM audit_logs a
      LEFT JOIN reports r ON a.report_id = r.id
      LEFT JOIN users u ON a.changed_by = u.id
      ORDER BY a.created_at DESC
    `);
    res.status(200).json(logs);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET ACTIVITY LOGS
exports.getActivityLogs = async (req, res) => {
  try {
    const [logs] = await db.query(`
      SELECT a.*, u.fullname as admin_name
      FROM activity_logs a
      LEFT JOIN users u ON a.admin_id = u.id
      ORDER BY a.created_at DESC
    `);
    res.status(200).json(logs);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};