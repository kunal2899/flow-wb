const express = require('express');
const { 
  registerUser, 
  loginUser,
} = require('../controllers/usersController');
const validateRegisterUser = require('../middlewares/users/validateRegisterUser');
const validateLoginUser = require('../middlewares/users/validateLoginUser');

const router = express.Router();

router.post('/register', validateRegisterUser, registerUser);
router.post('/login', validateLoginUser, loginUser);

module.exports = usersRoutes = router;