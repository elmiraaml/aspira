const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


// REGISTER
exports.register = async (req, res) => {
  try {
    const { fullname, email, password } = req.body;

    // cek email
    const [checkUser] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (checkUser.length > 0) {
      return res.status(400).json({
        message: "Email sudah digunakan",
      });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // insert user
    await db.query(
      `
      INSERT INTO users (
        fullname,
        email,
        password
      )
      VALUES (?, ?, ?)
      `,
      [fullname, email, hashedPassword]
    );

    res.status(201).json({
      message: "Register berhasil",
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};


// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // cek user
    const [users] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      return res.status(400).json({
        message: "Email tidak ditemukan",
      });
    }

    const user = users[0];

    // cek password
    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        message: "Password salah",
      });
    }

    // buat token
    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.status(200).json({
      message: "Login berhasil",
      token,
      user: {
        id: user.id,
        fullname: user.fullname,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// UPDATE PROFILE
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { fullname, email, password } = req.body;

    let updateQuery = "UPDATE users SET fullname = ?, email = ? WHERE id = ?";
    let queryParams = [fullname, email, userId];

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateQuery = "UPDATE users SET fullname = ?, email = ?, password = ? WHERE id = ?";
      queryParams = [fullname, email, hashedPassword, userId];
    }

    await db.query(updateQuery, queryParams);

    const [updatedUsers] = await db.query("SELECT id, fullname, email, role FROM users WHERE id = ?", [userId]);

    res.status(200).json({
      message: "Profil berhasil diperbarui",
      user: updatedUsers[0]
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server error",
    });
  }
};