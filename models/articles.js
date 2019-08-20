const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const articleSchema = new Schema(
  {
    title: {
      type: String,
      required: true
    },
    image: {
      type: String,
      required: false
    },
    content: {
      type: String,
      required: false
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    },
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: 'Comment'
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Article', articleSchema );