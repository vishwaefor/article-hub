var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
const swaggerJSDoc = require('./swaggerJSDoc');
const swaggerUi = require('swagger-ui-express');

var usersRouter = require('./routes/users');
var articlesRouter = require('./routes/articles');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));

//mongo db
const connection = mongoose.connect(
  `mongodb+srv://node-admin:node-admin-pass@vzz-dev-cluster-bvpom.mongodb.net/article-hub?retryWrites=true&w=majority`,
  { useNewUrlParser: true }
);
connection
  .then(db => {
    console.log('Connected correctly to mongo db server');
  })
  .catch(err => {
    console.log(err);
  });

app.use((req, res, next) => {

  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Request-With, Content-Type, Accept, Authorization');

  if (req.method === 'OPTIONS') {
    return res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET')
  }

  next();
});

app.get('/', (req, res) => {
  res.writeHead(302, {
    'Location': '/api-docs'

  });
  res.end();
});
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerJSDoc));

app.use('/users', usersRouter);
app.use('/articles', articlesRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json({ errors: [{ msg: err.message }] });
});

module.exports = app;
