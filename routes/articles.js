const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');

const Articles = require('../models/articles');
const Users = require('../models/users');

const { check, validationResult } = require('express-validator');

router.use(bodyParser.json());

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