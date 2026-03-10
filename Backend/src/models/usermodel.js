const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
      index: true,
    },
    profilePic: {
      type: String,
      default: "",
    },
    coverPhoto: {
      type: String,
      default: "",
    },
    isDisabled: {
      type: Boolean,
      default: false,
    },

    username: {
      type: String,
      trim: true,
      lowercase: true,
      default: null,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: null,
    },

    password: {
      type: String,
      select: false,
      default: null,
    },

    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },

    googleId: {
      type: String,
      default: null,
    },

    avatar: {
      type: String,
      default: null,
    },

    bio: {
      type: String,
      maxlength: 200,
      default: "",
    },

    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    posts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
    AccessToken: {
      type: String,
      default: null,
    },

    isVerified: {
      type: Boolean,
      default: false,
      index: true,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    lastLoginAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

userSchema.index(
  { email: 1 },
  {
    unique: true,
    partialFilterExpression: {
      email: { $type: "string" },
    },
  },
);

userSchema.index(
  { username: 1 },
  {
    unique: true,
    partialFilterExpression: {
      username: { $type: "string" },
    },
  },
);

userSchema.index(
  { googleId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      googleId: { $exists: true, $ne: null },
    },
  },
);

userSchema.index({ createdAt: -1 });

module.exports = mongoose.model("User", userSchema);
