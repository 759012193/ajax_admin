var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

// 引入权限控制函数
const authControl = require('./middleWare/authControl');
const database=require('./config/config').database;
//引入session相关
const session = require('express-session');
var MYSQLStore =require('express-mysql-session')(session);

const sessionStore = new MYSQLStore({
    host: database.HOST,
    port: database.PORT,
    user: database.USER,
    password: database.PASSWORD,
    database: database.DATABASE
})

//引入路由
var indexRouter = require('./routes/index');
const adminRouter = require('./routes/admin');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//引入默认中间件
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// 使用权限中间件
app.use(authControl);

//使用session中间件
app.use(session({
  key: 'yqPlan',
  secret: 'yqPlan', // 加密字符串
  store: sessionStore,
  resave: true, // 强制保存session, 即使她没有变化
  saveUninitialized: true, // 强制初始化
  cookie: {maxAge: 24 * 3600 * 1000},
  rolling: true //在每次请求时进行设置cookie，将重置cookie过期时间
}));

//使用路由中间件
app.use('/', indexRouter);
app.use('/api/auth/admin', adminRouter);



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
