const express = require("express");
const router = express.Router();
const Blog = require("../models/blog");

router.get("/add-new", (req, res) => {
  if (!req.user) return res.redirect("/user/signin"); // protected route
  res.render("addblog", { user: req.user });
});

//(POST)
router.post("/add-new", async (req, res) => {
  try {
    if (!req.user) return res.redirect("/user/signin");

    const { title, description, body, coverImageURL } = req.body;

    await Blog.create({
      title,
      description,
      body,
      coverImageURL: coverImageURL || undefined,
      author: req.user._id,
    });

    res.redirect("/blog/my-blogs");
  } catch (err) {
    console.error("Error creating blog:", err);
    res.status(500).send("Error creating blog");
  }
});

// My Blogs
router.get("/my-blogs", async (req, res) => {
  if (!req.user) return res.redirect("/user/signin");

  try {
    const blogs = await Blog.find({ author: req.user._id }).sort({ createdAt: -1 });
    res.render("blog/myblogs");

  } catch (err) {
    console.error("Error loading user blogs:", err);
    res.status(500).send("Error loading your blogs");
  }
});

// Public blog list
router.get("/", async (req, res) => {
  try {
    const blogs = await Blog.find()
      .populate("author", "fullName email")
      .sort({ createdAt: -1 });

    res.render("bloglist", { user: req.user, blogs });
  } catch (err) {
    console.error("Error loading blogs:", err);
    res.status(500).send("Error loading blogs");
  }
});

module.exports = router;
