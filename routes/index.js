var express = require('express');
var router = express.Router();
var User = require('../models/user');
var mid = require('../middleware');
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;

// GET /profile
router.get('/profile', mid.requiresLogin, function(req, res, next) {
  User.findById(req.session.userId)
      .exec(function (error, user) {
        if (error) {
          return next(error);
        } else {
          return res.render('profile', { title: 'Profile', name: user.name, favorite: user.favoriteBook });
        }
      });
});

router.get('/edit', function(req, res, next) {
  var id = req.query.id;
  var url = 'mongodb://localhost:27017/bookworm';
     MongoClient.connect(url, function(err, db) {
      if (err) throw err;
        var dbo = db.db("bookworm");
        dbo.collection("users").find({_id: ObjectId(id)}).toArray(function(err, result) {
            if (err) throw err;
            console.log(result);
              res.render('edit', {title:'list',data:result});
            db.close();
        });
  });
});
//db.users.deleteOne({'_id': ObjectId('5cfa592da4235c4a659a10d6')})
router.get('/delete', function(req, res) {
 
  var url = 'mongodb://localhost:27017/bookworm';
  MongoClient.connect(url, function(err, db) {
   if (err) throw err;
     var dbo = db.db("bookworm");
       db1= dbo.collection("users").deleteOne({'_id': ObjectId(req.query.id)});
         
         res.redirect('/list1');
      console.log(db1); 
  });
});

router.get('/list1', function(req, res, next) {
  if(req.session.userId == undefined) {
    return next(error);
  }
var url = 'mongodb://localhost:27017/bookworm';
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
      var dbo = db.db("bookworm");
      dbo.collection("users").find().toArray(function(err, result) {
        if (err) throw err;
            res.render('person', {title:'list',data:result});
        db.close();
      });
  });

});

router.post('/editvalue', function(req, res, next) {
    var id = req.body.id;
    var url = 'mongodb://localhost:27017/bookworm';
    MongoClient.connect(url, function(err, db) {
     if (err) throw err;
       var dbo = db.db("bookworm");
       dbo.collection("users").updateOne({'_id': ObjectId(id)}, {$set:{'name':req.body.name, 'email':req.body.email}}, function(err, result) {
         if (err) throw err;
          res.redirect('/list1');
         db.close();
     });
 });
});

  

  // mongoose.connect("mongodb://localhost:27017/bookworm", function(err, db) {
    
        
  //       // Find all employees 
  //       var employer = mongoose.model('users', empSchema);
  //       db.employer.find().pretty('name:"piyush"', function(err, docs){
  //         console.log("fdfd");
  //         // employeecollection.find({}).toArray(function(err, employeeResult) {
  //           if(err){
  //             res.render('person', {data: err});
  //           }else{
            
  //           }
  //     });
   

  // });
// person list
// router.get('/lists', mid.requiresLogin, function(req, res, next) {
//   User.find(function (error, user) {
//         if (error) {
//           return next(error);
//         } else {
//           return res.render('person', { title: 'Profile', name: user.name, favorite: user.favoriteBook });
//         }
//       });
// });
//list test
// router.get('/lisat', function(req, res, next) {
//   User.find(function(err, docs) {
//     var cursor=User.collection('users').find();
//     cursor.each(function(err, doc){
//       console.log(doc);
//     });

//     // log the `productChunks` variable to the console in order to verify the format of the data
//     console.log(productChunks);

//     return res.render('product', { title: 'Product Page', products: productChunks });
//   });
// });

// GET /logout
router.get('/logout', function(req, res, next) {
  if (req.session) {
    // delete session object
    req.session.destroy(function(err) {
      if(err) {
        return next(err);
      } else {
        return res.redirect('/');
      }
    });
  }
});

// GET /login
router.get('/login', mid.loggedOut, function(req, res, next) {
  return res.render('login', { title: 'Log In'});
});

// POST /login
router.post('/login', function(req, res, next) {
  if (req.body.email && req.body.password) {
    User.authenticate(req.body.email, req.body.password, function (error, user) {
      if (error || !user) {
        var err = new Error('Wrong email or password.');
        err.status = 401;
        return next(err);
      }  else {
        req.session.userId = user._id;
        return res.redirect('/profile');
      }
    });
  } else {
    var err = new Error('Email and password are required.');
    err.status = 401;
    return next(err);
  }
});

// GET /register
router.get('/register', mid.loggedOut, function(req, res, next) {
  return res.render('register', { title: 'Sign Up' });
});

// POST /register
router.post('/register', function(req, res, next) {
  if (req.body.email &&
    req.body.name &&
    req.body.favoriteBook &&
    req.body.password &&
    req.body.confirmPassword) {

      // confirm that user typed same password twice
      if (req.body.password !== req.body.confirmPassword) {
        var err = new Error('Passwords do not match.');
        err.status = 400;
        return next(err);
      }

      // create object with form input
      var userData = {
        email: req.body.email,
        name: req.body.name,
        favoriteBook: req.body.favoriteBook,
        password: req.body.password
      };

      // use schema's `create` method to insert document into Mongo
      User.create(userData, function (error, user) {
        if (error) {
          return next(error);
        } else {
          req.session.userId = user._id;
          return res.redirect('/profile');
        }
      });

    } else {
      var err = new Error('All fields required.');
      err.status = 400;
      return next(err);
    }
})

// GET /
router.get('/', function(req, res, next) {
  return res.render('index', { title: 'Home' });
});

// GET /about
router.get('/about', function(req, res, next) {
  return res.render('about', { title: 'About' });
});

// GET /contact
router.get('/contact', function(req, res, next) {
  return res.render('contact', { title: 'Contact' });
});

module.exports = router;
