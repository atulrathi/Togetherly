const User = require("../models/usermodel");
const Post = require("../models/postmodel");

const getOtherUserProfile = async (req, res) => {
    try{
        const username = req.params.username;
        console.log("Fetching profile for username:", username);
        const user = await User.findOne({ username: username} , {isDisabled:false}).select("-password");
        console.log("User found:", user);
        if(!user){
            return res.status(404).json({message: "User not found"});
        }
        const post  = await Post.find({author: user._id}).populate("author", "username profilePicture");
        console.log("Posts found:", post.length);
        res.status(200).json({user, posts: post});
    } catch (error) {
        res.status(500).json({message: "Error fetching user profile"});
    }
}

module.exports = { getOtherUserProfile };