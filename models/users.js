const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

const { check, validationResult } = require('express-validator');

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

    //rest of the code

  }
});

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

module.exports = mongoose.model('User', userSchema);