const mongoose = require('mongoose');
const Schema = mongoose.Schema;
/**
 * @swagger
 *
 * definitions:
 *   Comment:
 *     type: object
 *     required:
 *       - comment
 *     properties:
 *       comment:
 *         type: string
 */
const commentSchema = new Schema(
  {
    comment: {
      type: String,
      required: true
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Comment', commentSchema);
