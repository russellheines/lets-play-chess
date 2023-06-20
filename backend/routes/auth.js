var express = require('express');
var passport = require('passport');
var GoogleStrategy = require('passport-google-oidc');

passport.use(new GoogleStrategy({
    clientID: process.env['GOOGLE_CLIENT_ID'],
    clientSecret: process.env['GOOGLE_CLIENT_SECRET'],
    callbackURL: '/oauth2/redirect/google',
    scope: [ 'profile' ]
  }, function verify(issuer, profile, cb) {
    var user = {
      id: '101',
      username: 'TEST',
      name: profile.displayName
    };
    return cb(null, user);
  }));
    
passport.serializeUser(function(user, cb) {
  process.nextTick(function() {
    cb(null, { id: user.id, username: user.username, name: user.name });
  });
});

passport.deserializeUser(function(user, cb) {
  process.nextTick(function() {
    return cb(null, user);
  });
});

var router = express.Router();

router.get('/login/federated/google', passport.authenticate('google'));

router.get('/oauth2/redirect/google', passport.authenticate('google', {
    //successRedirect: 'http://localhost:3000/',
    //failureRedirect: 'http://localhost:3000/'
    successRedirect: '/',
    failureRedirect: '/'
  }));
  
router.get('/logout', function(req, res, next) {
    req.logout(function(err) {
      if (err) { return next(err); }
      //res.redirect('http://localhost:3000/');
      res.redirect('/');
    });
  });

router.get('/isAuthenticated', (req, res) => {
    res.json({name: req.user ? req.user.name : null});
  });
  
module.exports = router;