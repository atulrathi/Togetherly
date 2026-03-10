const User = require("../models/usermodel");
const Post = require("../models/postmodel");

const getUserByUsername = async (req, res) => {
  try {
    const id = req.user._id;
    const username = req.params.username;

    const user = await User.findOne({ _id: id  , isDisabled: false })
      .select("-password -googleId -__v")
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if(user.username !== username){
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this user's profile.",
      });
    }

    // Fetch the user's post count in parallel — no need to load all posts.
    const postCount = await Post.countDocuments({ author: id , isDisabled: false });

    return res.status(200).json({
      success: true,
      user: {
        _id:          user._id,
        name:         user.name,
        username:     user.username,
        avatar:       user.avatar,
        bio:          user.bio,
        followers:    user.followers.length,
        following:    user.following.length,
        postCount,
        isVerified:   user.isVerified,
        createdAt:    user.createdAt,
        profilePic:   user.profilePic,
        coverPhoto:   user.coverPhoto
      },
    });

  } catch (error) {
    console.error("[getUserByUsername]", error);

    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred. Please try again.",
    });
  }
};

const uploadProfileImage = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    user.profilePic = req.file.path;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile image uploaded",
      imageUrl: user.profilePic
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const uploadcoverphoto = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    user.coverPhoto = req.file.path;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Cover photo uploaded",
      imageUrl: user.coverPhoto
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addBio = async (req, res) => {
  try {
    const { bio } = req.body;
    const userid = req.user._id;
    const user = await User.findById(userid , { isDisabled: false });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.bio = bio;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Bio added successfully",
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const changeUsername = async (req,res)=>{
  try{
    const {username} = req.body;
    const userid = req.user._id
    const user = await User.findById(userid, { isDisabled: false });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // Check if the new username is already taken
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username already taken" });
    }
    user.username = username;
    await user.save();
    res.status(200).json({
      success: true,
      message: "Username updated successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
module.exports = { getUserByUsername , uploadProfileImage , uploadcoverphoto, addBio , changeUsername};