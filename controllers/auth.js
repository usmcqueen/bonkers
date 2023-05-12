import { db } from "../db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
// const dotenv = proce

const saltRounds = 10;

export const register = (req, res) => {
  console.log(req.body);

  // CHECK EXISTING USER
  const q = "SELECT * FROM users WHERE email = ? OR username = ?";

  db.query(q, [req.body.email, req.body.username], (error, data) => {

    if (error) return res.json(error);
    if (data.length) return res.status(409).json("User already exists");

    // HASH THE PASSWORD AND CREATE A USER
    // const bcrypt = require('bcryptjs');
    
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(req.body.password, salt);

    const q = "INSERT INTO users (username, email, password) VALUES (?);";
    const values = [req.body.username, req.body.email, hash];

    db.query(q, [values], (error, data) => {
      if (error) {
        console.log('insert error ', error);
        return res.status(500).json(error);
      }
      console.log('insert result ', data)
      return res.status(200).json("User has been created");
    });
  });

};

export const login = (req, res) => {
  console.log('server login request', req.body)
  // CHECK USER
  const q = `SELECT * FROM users WHERE username = ?`;

  db.query(q, [req.body.username], (error, data) => {
    console.log(data)

    if (error) return res.status(500).json(error);
 
    if (data.length === 0) return res.status(404).json("User does not exist");

    // CHECK PASSWORD
    // console.log('db.query ', data[0].password === req.body.password)

    const isPasswordCorrect = bcrypt.compareSync(req.body.password, data[0].password);

    if (!isPasswordCorrect) {
      // console.log('bcrypt error', isPasswordCorrect)
      return res.status(400).json("Wrong username or password");
    }
    const token = jwt.sign({ id: data[0].id }, "jwtkey");
    const { password, ...other } = data[0];

    res
      .cookie("access_token", token, {
        httpOnly: true,
      })
      .status(200)
      .json(other);
  });
};

export const logout = (req, res) => {
  res
    .clearCookie("access_token", {
      sameSite: "none",
      secure: true,
    })
    .status(200)
    .json("User is currently logged out");
};
