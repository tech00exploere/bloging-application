const { Schema, model } = require("mongoose");
const { createHmac, randomBytes } = require("crypto");

const userSchema = new Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true, 
      trim: true,
    },
    salt: {
      type: String,
      select: false,  
    },
    password: {
      type: String,
      required: true,
      select: false,  
    },
    profileImageURL: {
      type: String,
      default: "/images/default.png",
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  { timestamps: true }
);

userSchema.pre("save", function (next) {
  if (!this.isModified("password")) return next();

  this.salt = randomBytes(16).toString("hex");
  this.password = createHmac("sha256", this.salt)
    .update(this.password)
    .digest("hex");

  next();
});

// Login compare function
userSchema.statics.matchPassword = async function (email, password) {
  const user = await this.findOne({ email });
  if (!user) return null;

  const hashedPassword = createHmac("sha256", user.salt)
    .update(password)
    .digest("hex");

  if (hashedPassword === user.password) return user;
  return null;
};

// Login compare function
userSchema.statics.matchPassword = async function (email, password) {
  const user = await this.findOne({ email });
  if (!user) return null;

  const hashedPassword = createHmac("sha256", user.salt)
    .update(password)
    .digest("hex");

  if (hashedPassword === user.password) return user;
  return null;
};


// Custom static login helper
userSchema.statics.login = async function (email, password) {
  const user = await this.findOne({ email }).select("+password +salt");

  if (!user) throw new Error("No user found with this email");

  const hashed = createHmac("sha256", user.salt)
    .update(password)
    .digest("hex");

  if (hashed !== user.password) throw new Error("Invalid password");

  user.password = undefined;
  user.salt = undefined;
  return user;
};

// Ensure password never appears when converting to JSON
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.salt;
  return obj;
};

module.exports = model("User", userSchema);


// const { Schema, model } = require('mongoose');
// const { createHmac, randomBytes } = require('crypto');

// const userSchema = new Schema({
//   fullName: {
//     type: String,
//     required: true,
//   },
//   email: {
//     type: String,
//     required: true,
//     unique: true,
//   },
//   salt: {
//     type: String,
//     required: false,
//   },
//   password: {
//     type: String,
//     required: true,
//   },
//   profileImageURL: {
//     type: String,
//     required: true,
//     default: "/images/default.png"
//   },
//   role: {
//     type: String,
//     enum: ["user", "admin"],
//     default: "user",
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now,
//   },
// });

// // Hash password before saving
// userSchema.pre("save", function(next) {
//   const user = this;

//   if (!user.isModified("password")) return next();

//   // Generate random salt
//   const salt = randomBytes(16).toString();
//   user.salt = salt;

//   // Hash password using salt
//   const hashedPassword = createHmac("sha256", salt)
//     .update(user.password)
//     .digest("hex");

//   user.password = hashedPassword;
//   next();
// });

// // Static method to match password during login
// userSchema.statics.matchPassword = async function(email, password) {
//   const user = await this.findOne({ email });

//   if (!user) {
//     throw new Error("User not found");
//   }

//   const salt = user.salt;
//   const hashedPassword = user.password;

//   // Hash the provided password with stored salt
//   const userProvidedHash = createHmac("sha256", salt)
//     .update(password)
//     .digest("hex");

//   // Compare hashes
//   if (userProvidedHash === hashedPassword) {
//     user.password = undefined;
//     user.salt = undefined;
//     return user;
//   } else {
//     throw new Error("Incorrect password");
//   }
// };

// const User = model("user", userSchema);

// module.exports = User;
