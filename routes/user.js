const express = require('express');
const router = express.Router();
const User = require('../models/user.js');
const wrapAsync = require('../utils/wrapAsync');
const { route } = require('./listing');
const passport = require('passport');
const { saveRedirectUrl } = require('../middleware.js');

const userController = require('../controllers/users.js');
const user = require('../models/user.js');

router.route('/signup')
    .get(userController.renderSignUpForm)
    .post(wrapAsync(userController.signUp));

// router.get('/signup', userController.renderSignUpForm);
// router.post('/signup', wrapAsync(userController.signUp));

router.route('/login')
    .get(userController.renderLoginForm)
    .post(saveRedirectUrl, passport.authenticate('local', { failureRedirect: '/login', failureFlash: true}), userController.login);

// router.get('/login', userController.renderLoginForm);
// router.post('/login',saveRedirectUrl, passport.authenticate('local', { failureRedirect: '/login', failureFlash: true}), userController.login);

// logOut User functionality: 
router.get('/logout', userController.logout);

module.exports = router;