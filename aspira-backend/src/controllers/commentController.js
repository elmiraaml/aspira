const db = require("../config/db");

exports.getCommentsByReportId = async (req, res) => {
  try {
    const { reportId } = req.params;

    const [comments] = await db.query(
      `
      SELECT 
        comments.*,
        users.fullname as full_name,
        users.role
      FROM comments
      JOIN users ON comments.user_id = users.id
      WHERE comments.report_id = ?
      ORDER BY comments.created_at ASC
      `,
      [reportId]
    );

    res.status(200).json(comments);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.addComment = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { comment } = req.body;
    const user_id = req.user.id;

    if (!comment) {
      return res.status(400).json({ message: "Komentar tidak boleh kosong" });
    }

    await db.query(
      `
      INSERT INTO comments (report_id, user_id, comment)
      VALUES (?, ?, ?)
      `,
      [reportId, user_id, comment]
    );

    res.status(201).json({ message: "Komentar berhasil ditambahkan" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};
