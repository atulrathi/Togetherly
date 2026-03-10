const express = require("express");
const router = express.Router();
const userController = require("../controller/user.controller")
const {protect} = require("../Middleware/auth.middleware")
const upload = require("../Middleware/upload.middleware")
const {searchUsers} = require("../controller/search.controller")

router.get("/search", searchUsers); 

router.get("/:username", protect, userController.getUserByUsername);
router.post("/upload/profilepic", protect, upload.single("image"), userController.uploadProfileImage);
router.post("/upload/coverphoto", protect, upload.single("image"), userController.uploadcoverphoto);
router.post("/addbio", protect, userController.addBio);
router.post("/changeusername", protect, userController.changeUsername);

module.exports = router;