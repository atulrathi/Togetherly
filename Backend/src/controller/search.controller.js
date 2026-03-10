const User = require("../models/usermodel");

const searchUsers = async (req, res) => {
  const query = req.query.q;

  const users = await User.find({
    $or: [
      { username: { $regex: query, $options: "i" } },
    ]
  }).limit(10);

  res.json({
    success: true,
    users
  });
};

module.exports = {
  searchUsers
};