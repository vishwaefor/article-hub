const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');

const Articles = require('../models/articles');
const Users = require('../models/users');

const { check, validationResult } = require('express-validator');

router.use(bodyParser.json());

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