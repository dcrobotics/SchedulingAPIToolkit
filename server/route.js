// vendor library
var passport = require('passport');
var bcrypt   = require('bcrypt-nodejs');

// custom library
// model
var Model = require('./model');
var util  = require('./util.js');

// index
var index = function(req, rsp, next) {
  if( !req.isAuthenticated() ) {
    console.log('Request for ' + req.url + ' received from ' + req.headers['x-forwarded-for']);
    util.sendResponse(rsp, util.contType.TEXT, 'Welcome to DCR\'s node server' );
  } else {

    var user = req.user;

    if( user !== undefined ) {
      user = user.toJSON();
    }
    rsp.render('index', {title: 'Home', user: user});
  }
};

// sign in
// GET
var signIn = function(req, rsp, next) {
  if( req.isAuthenticated() ) rsp.redirect('/');
  rsp.render('signin', {title: 'Sign In'});
};

// sign in
// POST
var signInPost = function(req, rsp, next) {
  passport.authenticate('local', { successRedirect: '/',
                        failureRedirect: '/signin'}, function(err, user, info) {
    if( err ) {
      return rsp.render('signin', {title: 'Sign In', errorMessage: err.message});
    } 

    if( !user ) {
      return rsp.render('signin', {title: 'Sign In', errorMessage: info.message});
    }
      return req.logIn(user, function(err) {
      if( err ) {
        return rsp.render('signin', {title: 'Sign In', errorMessage: err.message});
      } else {
        return rsp.redirect('/');
      }
    });
  })(req, rsp, next);
};

// sign up
// GET
var signUp = function(req, rsp, next) {
  if( req.isAuthenticated() ) {
    rsp.render('signup', {title: 'Sign Up'});
  } else {
    notFound404(req, rsp, next);
  }
};

// sign up
// POST
var signUpPost = function(req, rsp, next) {
  if(!req.isAuthenticated()) {
    notFound404(req, rsp, next);
  } else {
    var user = req.body;
    var usernamePromise = null;
    usernamePromise = new Model.User({username: user.username}).fetch();

    return usernamePromise.then(function(model) {
      if( model ) {
         rsp.render('signup', {title: 'signup', errorMessage: 'username already exists'});
      } else if( user.password != user.password_verification ) {
         rsp.render('signup', {title: 'signup', errorMessage: 'Passwords do no match'});
         console.log(user.password);
         console.log(user.password_verification);
      } else {
        var password = user.password;
        var hash = bcrypt.hashSync(password);

        var signUpUser = new Model.User({username: user.username, password: hash});

        signUpUser.save().then(function(model) {
          return rsp.redirect('/signup');
        });
      }
    });
  }
};

// sign out
var signOut = function(req, rsp, next) {
  if( !req.isAuthenticated() ) {
    notFound404(req, rsp, next);
  } else {
    req.logout();
    rsp.redirect('/signin');
  }
};

// 404 not found
var notFound404 = function(req, rsp, next) {
  rsp.status(404);
  rsp.render('404', {title: '404 Not Found'});
};

// export functions
/**************************************/
// index
module.exports.index = index;

// sigin in
// GET
module.exports.signIn = signIn;
// POST
module.exports.signInPost = signInPost;

// sign up
// GET
module.exports.signUp = signUp;
// POST
module.exports.signUpPost = signUpPost;

// sign out
module.exports.signOut = signOut;

// 404 not found
module.exports.notFound404 = notFound404;