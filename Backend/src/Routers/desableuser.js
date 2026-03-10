const express = require("express");
const router = express.Router();
const { disableUser } = require("../controller/userdesable");
const { protect } = require("../Middleware/auth.middleware");

router.post("/disableuser", protect, disableUser);

module.exports = router;