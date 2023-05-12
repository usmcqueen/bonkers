import express from "express";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import postRoutes from "./routes/posts.js";
import { compareAsc, format } from "date-fns";
import cookieParser from "cookie-parser";
import multer from "multer";
import cors from "cors";
// import dotenv from "dotenv";


// dotenv.config();
// require('dotenv').config();

const app = express();
app.use(cors({ origin: "http://127.0.0.1:3000" }));

// app.use(cors({ origin: process.env.CLIENT_URL }));

app.use(express.json());
app.use(cookieParser());

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "../client/public/upload");
  },
  filename: function (req, file, cb) {
    cb(null, format(new Date(), "yyy-MM-dd HH:mm:ss") + file.originalname);
  },
});

const upload = multer({ storage });

app.post("/api/upload", upload.single("file"), function (req, res) {
  const file = req.file;
  res.status(200).json(file.filename);
});

app.use('/api', userRoutes);

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);

app.get("/test", (req, res) => {
  res.json("It works!");
});

app.listen(8080, () => {
  console.log("Server started on port 8080");
});

// app.listen(process.env.PORT || 8080, () => {
//   console.log(`Server started on port ${process.env.PORT || 8080}`);
// });
