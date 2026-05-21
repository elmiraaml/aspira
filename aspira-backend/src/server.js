const express = require("express");
const cors = require("cors");
require("dotenv").config();

const db = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const reportRoutes = require("./routes/reportRoutes");
const adminRoutes = require("./routes/adminRoutes");
const commentRoutes = require("./routes/commentRoutes");

const app = express();

app.use(cors());
app.use(express.json());

db.getConnection()
  .then(() => {
    console.log("MySQL Connected");
  })
  .catch((err) => {
    console.log(err);
  });

app.use("/api/auth", authRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/comments", commentRoutes);

app.get("/", (req, res) => {
  res.send("API Aspira Berjalan...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
});