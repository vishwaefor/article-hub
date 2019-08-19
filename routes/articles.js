var express = require('express');
var router = express.Router();
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const { check, validationResult } = require('express-validator');



const Articles  = require('../models/articles');
const Users = require('../models/users');

router.use(bodyParser.json());

router.post('/', function(req, res, next) {
  let article = req.body;

  new Promise((resolve, reject) => {

    article.title = null;
    article.comments = [];
   
  })
    .then(article => {
      return Article.create(article);
    })
    .then(article => {
      console.log('article created', article.title);
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json({ id: article._id, title: article.title, image: article.image, content:article.content, author:article.author,
      comments:article.comments });
    })
    .catch(err => {
      next(err);
    });
});

router.post(
  '/',
  [
    // title should be given
    check('title')
      .exists()
      .withMessage('title is not provided')
      .isLength({ min: 5 })
      .withMessage('minimum 5 charactors required for title'),
    // content should be given
    check('content')
      .exists()
      .withMessage('content is not provided')
      .isLength({ min: 20 })
      .withMessage('minimum 20 charactors required for content'),
    // image should be given
    check('image').exists()
  ],
  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(422).json({ errors: errors.array() });
    } else {
      const article = req.body;
      Users.findOne() // We are tempory adding a user as the author
        .then(author => {
          article.author = author._id;
          article.comments = [];
          return Articles.create(article);
        })
        .then(article => {
          res
            .status(201)
            .json({
              message: 'article created',
              id: article._id,
              title: article.title
            });
        })
        .catch(err => next(err));
    }
  }
);

module.exports = router;
