const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    content: {
      type: String,
      trim: true,
      maxlength: 2000
    },

    images: [
      {
        type: String // Cloudinary / S3 URLs later
      }
    ],

    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],

    commentsCount: {
      type: Number,
      default: 0
    },

    likesCount: {
      type: Number,
      default: 0
    },

    isEdited: {
      type: Boolean,
      default: false
    },

    isDeleted: {
      type: Boolean,
      default: false
    },
    isDisabled: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

postSchema.index({ createdAt: -1 });

postSchema.index({ author: 1, createdAt: -1 });

module.exports = mongoose.model("Post", postSchema);
