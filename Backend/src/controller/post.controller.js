const Post = require("../models/postmodel");
const User = require("../models/usermodel")

const createPost = async (req, res) => {
  try {
    const { content} = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId , { isDisabled: false });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const post = await Post.create({
      author: req.user._id,
      content,
    });

    user.posts.push(post._id);
    await user.save();

    res.status(201).json({
      success: true,
      message: "Post created successfully",
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//post likes
const toggleLike = async (req, res) => {
  try {
    const postId = req.params.postId;
    const userId = req.user._id;

    const post = await Post.findById(postId, { isDisabled: false });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const isLiked = post.likes.includes(userId);

    if (isLiked) {
      post.likes.pull(userId);   // remove like
    } else {
      post.likes.push(userId);   // add like
    }

    await post.save();

    res.status(200).json({
      success: true,
      message: isLiked ? "Post unliked" : "Post liked",
      totalLikes: post.likes.length
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//delete Post 
const deletePost = async (req, res) => {
  try {
    const postId = req.params.postId;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this post" });
    }

    post.isDeleted = true;
    await post.save();

    res.status(200).json({
      success: true,
      message: "Post deleted successfully"
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



module.exports = { createPost , toggleLike , deletePost};
