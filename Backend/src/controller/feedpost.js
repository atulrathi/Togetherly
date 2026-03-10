const Post = require("../models/postmodel");

const getPosts = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = 10;

    const posts = await Post.find({isDisabled:false , isDeleted:false})
      .populate("author", "name email  profilePic")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const totalPosts = await Post.countDocuments({ isDisabled: false });

    res.status(200).json({
      success: true,
      page,
      totalPages: Math.ceil(totalPosts / limit),
      totalPosts,
      posts,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = { getPosts };
