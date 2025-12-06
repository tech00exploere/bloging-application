const express = require("express");
const path = require("path");
require("dotenv").config();
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");

const checkAuth = require("./middleware/checkAuth");
const blogRoute = require("./router/blog");
const userRoute = require("./router/user");

const app = express();

// Environment variables (make sure .env has NAME, PORT, MONGO_URL)
console.log("My name is:", process.env.NAME);
const port = process.env.PORT || 4578;

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("DB connection error:", err));

// View Engine Setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Authentication middleware
app.use(checkAuth);

//  Pass logged-in user to all templates
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  next();
});

// Routes
app.get("/", (req, res) => {
  res.render("home", { user: req.user });
});

// Redirects
app.get("/signin", (req, res) => res.redirect("/user/signin"));
app.get("/signup", (req, res) => res.redirect("/user/signup"));

// Routers
app.use("/user", userRoute);
app.use("/blog", blogRoute);

// Logout
app.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/");
});

// 404 Handler
app.use((req, res) => {
  res.status(404).render("404");
});
//error handaling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render("500");
});
app.listen(port, () => {
  console.log(` Server running at http://localhost:${port}`);
});