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

router.get('/', (req, res, next) => {
    Articles.find()
      .populate('author')
      .then(results => {
        res.status(200).json({
          results: results.map(r => {
            return {
              id: r.id,
              title: r.title,
              content: r.content,
              image: r.image,
              author:
                (r.author && { id: r.author._id, name: r.author.name }) || null
            };
          })
        });
      })
      .catch(err => next(err));
  });

  router.get('/:id', (req, res, next) => {
    Articles.findById(req.params.id)
      .populate('author', 'comments.author')
      .then(
        r => {
          if (r) {
            res.status(200).json({
              id: r.id,
              title: r.title,
              content: r.content,
              image: r.image,
              author:
                (r.author && { id: r.author._id, name: r.author.name }) || null
            });
          } else {
            const error = new Error('no article found');
            error.status = 404;
            throw error;
          }
        },
        err => {
          const error = new Error('invalid article id');
          error.status = 400;
          throw error;
        }
      )
      .catch(err => next(err));
  });

module.exports = router;