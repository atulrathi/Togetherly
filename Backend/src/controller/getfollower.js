const User = require("../models/usermodel");

async function getfollower(req, res) {
  const userId = req.user._id;
  try {
    const user = await User.findById(userId , { isDisabled: false })
      .populate({
        path: "followers",
        match: { isDisabled: { $ne: true } },
        select: "-AccessToken -password -email",
      })
      .populate({
        path: "following",
        match: { isDisabled: { $ne: true } },
        select: "-AccessToken -password -email",
      })
      .select("-AccessToken -password -email");

    if (!user) {
      return res.status(401).send("user not found");
    }

    res.status(200).send(user);
  } catch (err) {
    console.log(err.message);
  }
}

module.exports = { getfollower };