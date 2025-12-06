const router = require("express").Router();
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

// GET - Login Page
router.get("/signin", (req, res) => {
  return res.render("signin", { error: null });
});

// GET - Signup Page
router.get("/signup", (req, res) => {
  return res.render("signup", { error: null });
});

// POST - Signup
router.post("/signup", async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    const user = await User.create({ fullName, email, password });

    const token = jwt.sign({ _id: user._id }, JWT_SECRET);
    res.cookie("token", token, { httpOnly: true });

    return res.redirect("/");
  } catch (err) {
    console.error("Signup error:", err);
    return res.render("signup", { error: "This email already exists" });
  }
});

// POST - Signin
router.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.login(email, password);

    const token = jwt.sign({ _id: user._id }, JWT_SECRET);
    res.cookie("token", token, { httpOnly: true });

    return res.redirect("/");
  } catch (err) {
    console.error("Signin error:", err);
    return res.render("signin", { error: "Invalid Email or Password" });
  }
});

// Logout
router.get("/logout", (req, res) => {
  res.clearCookie("token");
  return res.redirect("/signin");
});

module.exports = router;
