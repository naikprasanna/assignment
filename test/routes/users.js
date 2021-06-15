var express = require('express');
var router = express.Router();
const bodyParser = require('body-parser');
var User = require('../models/users');
var authenticate = require('../authenticate');


router.use(bodyParser.json());




var passport = require('passport');




router.get('/',(req,res,next)=>{

  User.find({}).then(function(user){
    console.log(user)
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(user);
  },(err)=>next(err))
  .then((err)=>next(err))
});

router.get('/:userId',(req,res,next)=>{
  User.findById(req.params.userId).then(function(user){
    console.log(user)
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(user);
  },(err)=>next(err))
  .then((err)=>next(err))
});



router.post('/signup', (req, res, next) => {
  
  User.register(new User({username: req.body.username}), 
    req.body.password, (err, user) => {
    if(err) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.json({err: err});
    }
    else {
      if (req.body.firstname)
        user.firstname = req.body.firstname;
      if (req.body.lastname)
        user.lastname = req.body.lastname;
      user.save((err, user) => {
        if (err) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.json({err: err});
          return ;
        }
        passport.authenticate('local')(req, res, () => {

          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json({success: true, status: 'Registration Successful!'});
        });
      });
    }
  });
});


router.post('/delete/:userId', passport.authenticate('local'), (req, res) => {
  User.findByIdAndRemove(req.params.userId)
  .then(function(user){
      console.log("requesting dishes");
      console.log(user);
      res.statusCode=200;
      res.setHeader("content-type","application/json");
      res.json(user);
  },function(err){ next(err)})
  .catch(function(err){
      next(err);
  })

});


router.post('/login', passport.authenticate('local'), (req, res) => {

  var token = authenticate.getToken({_id: req.user._id});
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json({success: true, token: token, status: 'You are successfully logged in!'});
});




router.get('/logout', (req, res,next) => {
  if (authenticate.verifyUser) {
    req.session.destroy();
    res.clearCookie('session-id');
    res.redirect('/');
  }
  else {
    var err = new Error('You are not logged in!');
    err.status = 403;
    next(err);
  }
});



module.exports = router;