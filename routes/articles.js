const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');

const Articles = require('../models/articles');
const Users = require('../models/users');

const {
    check,
    validationResult
} = require('express-validator');

router.use(bodyParser.json());

router.post(
    '/',
    [
        // title should be given
        check('title')
        .exists()
        .withMessage('title is not provided')
        .isLength({
            min: 5
        })
        .withMessage('minimum 5 charactors required for title'),
        // content should be given
        check('content')
        .exists()
        .withMessage('content is not provided')
        .isLength({
            min: 20
        })
        .withMessage('minimum 20 charactors required for content'),
        // image should be given
        check('image').exists()
    ],
    (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            res.status(422).json({
                errors: errors.array()
            });
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

//GET route for retrieving all the articles GET / articles
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
                        author: (r.author && {
                            id: r.author._id,
                            name: r.author.name
                        }) || null
                    };
                })
            });
        })
        .catch(err => next(err));
});

//GET route for retrieving all the articles GET / articles /: id
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
                        author: (r.author && {
                            id: r.author._id,
                            name: r.author.name
                        }) || null
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

//POST / articles /: id / comments should be implemented like in above issues
router.post(
    '/:id/comments',
    [
        // title should be given
        check('comment')
        .exists()
        .withMessage('comment is not provided')
        .isLength({
            min: 10
        })
        .withMessage('minimum 10 charactors required for comment')
    ],
    (req, res, next) => {
        Articles.findById(req.params.id)
            .populate('author', 'comments.author')
            .then(
                r => {
                    if (r) {
                        const errors = validationResult(req);

                        if (!errors.isEmpty()) {
                            res.status(422).json({
                                errors: errors.array()
                            });
                        } else {
                            const comment = req.body;
                            Users.findOne() // We are tempory adding a user as the author
                                .then(author => {
                                    comment.author = author._id;
                                    Comments.create(comment)
                                        .then(comment => {
                                            r.comments.push(comment);
                                            return r.save();
                                        })
                                        .then(r => {
                                            res.status(201).json({
                                                message: 'comment added'
                                            });
                                        });
                                });
                        }
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
    }
);

//GET /articles/:id/comments for retrieving all the comments for an article
router.get('/:id/comments', (req, res, next) => {
    Articles.findById(req.params.id)
        .then(
            r => {
                if (r) {
                    return Comments.find({
                        _id: {
                            $in: r.comments
                        }
                    }).populate('author');
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

        .then(comments => {
            res.status(200).json({
                results: comments.map(c => {
                    return {
                        id: c._id,
                        comment: c.comment,
                        author: {
                            name: c.author.name,
                            id: c.author._id
                        },
                        createdAt: c.createdAt
                    };
                })
            });
        })
        .catch(err => next(err));
});

//PUT /articles/:id for editing an article
router.put('/:id', (req, res, next) => {
    Articles.findByIdAndUpdate(req.params.id, {
            $set: req.body
        })
        .populate('author', 'comments.author')
        .then(
            r => {
                if (r) {
                    res.status(200).json({
                        id: r.id,
                        title: r.title,
                        content: r.content,
                        image: r.image,
                        author: (r.author && {
                            id: r.author._id,
                            name: r.author.name
                        }) || null
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

//DELETE /articles/:id for deleting an article
router.delete('/:id', (req, res, next) => {
    Articles.findByIdAndDelete(req.params.id)
        .then(
            r => {
                if (r) {
                    res.status(200).json({
                        id: r.id,
                        status: "Article " + r.id + " has removed."
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