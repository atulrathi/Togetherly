const Post = require("../models/postmodel");

const ALLOWED_SORT_FIELDS = ["createdAt", "likes"];
const MAX_LIMIT = 50;
const DEFAULT_LIMIT = 10;

const getUserPosts = async (req, res) => {
  try {
   
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: No valid session found.",
      });
    }

    const userId = req.user.id;

    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(req.query.limit) || DEFAULT_LIMIT));
    const skip  = (page - 1) * limit;

    const sortField = ALLOWED_SORT_FIELDS.includes(req.query.sortBy)
      ? req.query.sortBy
      : "createdAt";
    const sortOrder = req.query.order === "asc" ? 1 : -1;

    const [posts, total] = await Promise.all([
      Post.find({ author: userId , isDisabled: false , isDeleted: false })
        .select("title content createdAt updatedAt likes") 
        .populate("author", "name profilePic")      
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean(),     
      Post.countDocuments({ author: userId , isDisabled: false }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        posts,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          hasNextPage: page < Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error(`[getUserPosts] userId=${req.user?.id}`, error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again later.",
    });
  }
};

module.exports = { getUserPosts };