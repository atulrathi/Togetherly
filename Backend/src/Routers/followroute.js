const express = require("express");
const router = express.Router();
const {toggleFollow}= require("../controller/follow.controller");
const {protect} = require("../Middleware/auth.middleware");
const {getfollower} = require("../controller/getfollower")

router.post("/:userId",protect,toggleFollow);
router.get("/followers",protect,getfollower)

module.exports = router