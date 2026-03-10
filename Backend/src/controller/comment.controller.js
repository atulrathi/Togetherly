const Comment = require("../models/commentmodel");
const Post = require("../models/postmodel");

//add comment 
const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const postId = req.params.postId;

    const post = await Post.findById(postId , {isDisabled:false});

    if (!post || post.isDisabled) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comment = await Comment.create({
      post: postId,
      user: req.user._id,
      text
    });

    res.status(201).json({
      success: true,
      message: "Comment added",
      comment
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//getcomment
const getComments = async (req, res) => {
  try {
    const postId = req.params.postId;
    const page = Number(req.query.page) || 1;
    const limit = 5;

    const comments = await Comment.find({
      post: postId,
      isDisabled: false
    })
      .populate("user", "name profilePic")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const totalComments = await Comment.countDocuments({
      post: postId,
      isDisabled: false
    });

    res.status(200).json({
      success: true,
      totalComments,
      page,
      comments
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//delete comment 
const deleteComment = async (req, res) => {
  try {
    const commentId = req.params.commentId;

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    comment.isDisabled = true;
    comment.disabledAt = new Date();

    await comment.save();

    res.status(200).json({
      success: true,
      message: "Comment deleted"
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports= {getComments,addComment,deleteComment};