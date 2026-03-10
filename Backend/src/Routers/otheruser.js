const express = require("express");
const router = express.Router();
const { getOtherUserProfile } = require("../controller/otheruser.controller");
const { protect } = require("../Middleware/auth.middleware");

router.get("/:username", protect, getOtherUserProfile);

module.exports = router;