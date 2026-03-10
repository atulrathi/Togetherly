const User = require("../models/usermodel");

const toggleFollow = async (req, res) => {
  try {
    const targetUserId = req.params.userId;
    const currentUserId = req.user._id;

    if (targetUserId === currentUserId.toString()) {
      return res.status(400).json({
        message: "You cannot follow yourself"
      });
    }

    const targetUser = await User.findById(targetUserId , {isDisabled:false});
    const currentUser = await User.findById(currentUserId , {idDisabled:false});

    if (!targetUser) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const isFollowing = currentUser.following.includes(targetUserId);

    if (isFollowing) {
      // Unfollow
      currentUser.following.pull(targetUserId);
      targetUser.followers.pull(currentUserId);
    } else {
      // Follow
      currentUser.following.push(targetUserId);
      targetUser.followers.push(currentUserId);
    }

    await currentUser.save();
    await targetUser.save();

    res.status(200).json({
      success: true,
      message: isFollowing ? "Unfollowed" : "Followed",
      totalFollowers: targetUser.followers.length
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {toggleFollow};
