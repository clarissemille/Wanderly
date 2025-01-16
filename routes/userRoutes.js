const express = require('express');
// const { register, login } = require('../controllers/userController');
const router = express.Router();
const authController = require("../controllers/auth.controller");




// // auth
router.post('/register', authController.signUp);
router.post('/login', authController.signUp);

module.exports = router;
