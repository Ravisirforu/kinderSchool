var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const expressSession = require('express-session');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const flash = require('connect-flash');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(flash());
app.use(expressSession({
  resave:false,
  saveUninitialized:false,
  secret: process.env.EXPRESS_SESSION_SECRET
}));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

app.all("*",function(req,res,next){
  res.status(404).json({success:false,message:`${req.url} route not found`});
})



module.exports = app;
