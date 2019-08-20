var express = require('express');
var router = express.Router();
const { check, validationResult } = require('express-validator');

const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');

const Users = require('../models/users');

router.use(bodyParser.json());

router.post('/', [
  // name must be an email
  check('email').isEmail(),
  // password must be at least 5 chars long
  check('password').isLength({ min: 5 })
], (req, res, next) => {

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(422).json({ errors: errors.array() });
  } else {

    let user = req.body;

    Users.findOne({ email: user.email })
      .then(found => {
        if (found) {
          const error = new Error('please use another email');
          error.status = 403;
          throw error;
        } else {
          return new Promise((resolve, reject) => {
            bcrypt.hash(user.password, 10, (err, hash) => {
              if (err) {
                reject(err);
              } else {
                user.password = hash;
                resolve(user);
              }
            });
          });
        }
      })
      .then(user => {
        return Users.create(user);
      })
      .then(user => {
        res.status(200).json({ id: user._id, name: user.name, email: user.email });
      })
      .catch((err) => {
        next(err);
      });
  }
});


router.post('/', function (req, res, next) {
  let user = req.body;

  new Promise((resolve, reject) => {
    bcrypt.hash(user.password, 10, (err, hash) => {
      if (err) {
        reject(err);
      } else {
        user.password = hash;
        resolve(user);
      }
    });
  })
    .then(user => {
      return Users.create(user);
    })
    .then(user => {
      console.log('user created', user.name, user.email);
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json({ id: user._id, name: user.name, email: user.email });
    })
    .catch(err => {
      next(err);
    });
});


/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

module.exports = router;
