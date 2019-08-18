var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

const express = require('express');
const router = express.Router();

const bodyParser = require('body-parser');
router.use(bodyParser.json());



var express = require('express');
var router = express.Router();
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');

const Users = require('../models/users');

router.use(bodyParser.json());

router.post('/', function(req, res, next) {
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

module.exports = router;
