const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
// Load User model
const User = require('../models/User');
const { forwardAuthenticated } = require('../config/auth');

// Login Page
router.get('/login', forwardAuthenticated, (req, res) => res.render('login'));

// Register Page
router.get('/register', forwardAuthenticated, (req, res) => res.render('register'));


// Register
router.post('/register', (req, res) => {
  const { name, email, password, password2, invite, group } = req.body;
  let errors = [];

  if (!name || !email || !password || !password2 || !invite || !group) {
    errors.push({ msg: 'Please enter all fields' });
  }

  if (password != password2) {
    errors.push({ msg: 'Passwords do not match' });
  }

  if (password.length < 6) {
    errors.push({ msg: 'Password must be at least 6 characters' });
  }

  if (password.length > 16) {
    errors.push({ msg: 'Password is too long' });
  }

  if (group.length > 12) {
    errors.push({ msg: 'Group name is too long' });
  }
 
  if (group != "Admin") { // Setting name restrictions
    errors.push({ msg: 'Group name is not allowed' });
  }
 
// Invite System is just a simple if statement, you can make this automated.
  if (invite != "invite0" &&
   invite != "invite1" &&
   invite != "invite2" &&
   invite != "invite3" &&
   invite != "invite4" &&
   invite != "invite5" &&
   invite != "invite6" &&
   invite != "invite7" &&
   invite != "invite8"
   ) {
    errors.push({ msg: 'Invite Invalid' });
  }  




               
  if (errors.length > 0) {
    res.render('register', {
      errors,
      name,
      email,
      password,
      password2,
      invite,
      group
    });
  } else {
    User.findOne({ invite: invite }) && User.findOne({ name: name }).then(user => {
      if (user) { 
        errors.push({ msg: 'Username Exists' });
        res.render('register', {
          errors,
          name,
          email,
          password,
          password2,
          invite,
          group
       
        });
      } else {
        const newUser = new User({
          name,
          email,
          password,
          invite,
          group
        });

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then(user => {
                req.flash(
                  'success_msg',
                  'You are now registered and can log in'
                );
                res.redirect('/login');
              })
              .catch(err => console.log(err));
          });
        });
      }
    });
  }
});

// Login
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/login',
    failureFlash: true
  })(req, res, next);
});

// Logout
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/login');
});

module.exports = router;


