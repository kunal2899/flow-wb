const express = require("express");
const { registerUser, loginUser } = require("@controllers/users.controller");
const validateRegisterUser = require("@middlewares/validators/users/validateRegisterUser");
const validateLoginUser = require("@middlewares/validators/users/validateLoginUser");

const router = express.Router();

router.post("/register", validateRegisterUser, registerUser);
router.post("/login", validateLoginUser, loginUser);

module.exports = usersRoutes = router;
