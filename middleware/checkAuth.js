const jwt = require("jsonwebtoken");
const User = require("../models/user");

module.exports = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(token, "supersecret"); // ✅ same as in user.js
    const user = await User.findById(decoded._id).lean();

    req.user = user || null;
    next();
  } catch (err) {
    console.error("Auth middleware error:", err.message);
    req.user = null;
    next();
  }
};