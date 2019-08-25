const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');

const Users = require('../models/users');

const { check, validationResult } = require('express-validator');

router.use(bodyParser.json());
/**
 * @swagger
 *
 * /users:
 *  post:
 *    description: register a new user
 *    tags:
 *       - name: "Users"
 *    consumes:
 *       - "application/json"
 *    produces:
 *       - application/json
 *    parameters:
 *       - in: body
 *         name: user
 *         required: true
 *         description: The user to be registered
 *         schema:
 *            $ref: '#/definitions/User'
 *    responses:
 *      201:
 *        description: user registered
 */
router.post(
  '/',
  [
    // name must be an email
    check('email')
      .isEmail()
      .withMessage('invalid email provided'),
    // password must be at least 5 chars long
    check('password')
      .exists()
      .withMessage('password not provided')
      .isLength({ min: 5 })
      .withMessage('minimum 5 charactors required for password')
  ],
  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(422).json({ errors: errors.array() });
    } else {
      const user = req.body;

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
          res.status(200).json({
            message: 'user registered',
            id: user._id,
            name: user.name,
            email: user.email
          });
        })
        .catch(err => {
          next(err);
        });
    }
  }
);

module.exports = router;
