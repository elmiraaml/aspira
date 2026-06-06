const db = require("../config/db");
const supabase = require("../config/supabase");


// CREATE REPORT
exports.createReport = async (req, res) => {
  try {
    const {
      category_id,
      title,
      description,
      location,
      image,
      incident_date,
      priority,
    } = req.body;

    const user_id = req.user.id;

    await db.query(
      `
      INSERT INTO reports (
        user_id,
        category_id,
        title,
        description,
        location,
        image,
        incident_date,
        priority
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        user_id,
        category_id,
        title,
        description,
        location,
        image,
        incident_date,
        priority || 'low',
      ]
    );

    res.status(201).json({
      message: "Laporan berhasil dibuat",
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};


// GET ALL REPORTS
exports.getReports = async (req, res) => {
  try {

    const [reports] = await db.query(
      `
      SELECT
        reports.*,
        users.fullname,
        categories.name AS category_name

      FROM reports

      JOIN users
      ON reports.user_id = users.id

      JOIN categories
      ON reports.category_id = categories.id

      ORDER BY reports.created_at DESC
      `
    );

    res.status(200).json(reports);

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};


// GET MY REPORTS
exports.getMyReports = async (req, res) => {
  try {
    const user_id = req.user.id;

    const [reports] = await db.query(
      `
      SELECT
        reports.*,
        users.fullname,
        categories.name AS category_name
      FROM reports
      JOIN users ON reports.user_id = users.id
      JOIN categories ON reports.category_id = categories.id
      WHERE reports.user_id = ?
      ORDER BY reports.created_at DESC
      `,
      [user_id]
    );

    res.status(200).json(reports);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET CATEGORIES
exports.getCategories = async (req, res) => {
  try {
    const [categories] = await db.query("SELECT id, name AS category_name FROM categories");
    res.status(200).json(categories);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};


// GET DETAIL REPORT
// GET DETAIL REPORT
exports.getReportById = async (req, res) => {
  try {
    const { id } = req.params;

    const [reports] = await db.query(
      `
      SELECT
        reports.*,
        users.fullname,
        users.email,
        categories.name AS category_name
      FROM reports
      JOIN users ON reports.user_id = users.id
      JOIN categories ON reports.category_id = categories.id
      WHERE reports.id = ?
      `,
      [id]
    );

    if (reports.length === 0) {
      return res.status(404).json({ message: "Laporan tidak ditemukan" });
    }

    res.status(200).json(reports[0]);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

// UPDATE REPORT
exports.updateReport = async (req, res) => {
  try {

    const { id } = req.params;

    const {
      category_id,
      title,
      description,
      location,
      image,
      status,
      incident_date,
      priority,
    } = req.body;

    await db.query(
      `
      UPDATE reports
      SET
        category_id = ?,
        title = ?,
        description = ?,
        location = ?,
        image = ?,
        status = ?,
        incident_date = ?,
        priority = COALESCE(?, priority)
      WHERE id = ?
      `,
      [
        category_id,
        title,
        description,
        location,
        image,
        status,
        incident_date,
        priority,
        id,
      ]
    );

    res.status(200).json({
      message: "Laporan berhasil diupdate",
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};


// DELETE REPORT
exports.deleteReport = async (req, res) => {
  try {

    const { id } = req.params;

    await db.query(
      "DELETE FROM reports WHERE id = ?",
      [id]
    );

    res.status(200).json({
      message: "Laporan berhasil dihapus",
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

exports.uploadImage = async (req, res) => {
  try {

    if (!req.file) {
      return res.status(400).json({
        message: "File tidak ada",
      });
    }

    const file = req.file;

    const fileName = `${Date.now()}-${file.originalname}`;

    // upload ke supabase
    const { data, error } = await supabase.storage
      .from("reports")
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
      });

    if (error) {
      console.log(error);

      return res.status(500).json({
        message: "Upload gagal",
      });
    }

    // ambil public url
    const {
      data: publicUrlData,
    } = supabase.storage
      .from("reports")
      .getPublicUrl(fileName);

    res.status(200).json({
      message: "Upload berhasil",
      image_url: publicUrlData.publicUrl,
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};