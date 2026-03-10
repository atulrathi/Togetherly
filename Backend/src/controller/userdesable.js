const User = require("../models/usermodel");
const Post = require("../models/postmodel")

const disableUser = async (req, res) => {
  const userId = req.user._id;

  try {
    await User.findByIdAndUpdate(userId, { isDisabled: true });

    await Post.updateMany(
      { author: userId },
      { $set: { isDisabled: true } }
    );

    res.status(200).json({
      message: "User disabled and posts removed successfully"
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { disableUser };