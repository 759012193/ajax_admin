// 引入类库相关
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

// 引入权限控制函数
const authControl = require('./middleWare/authControl');

// 引入session相关
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const database = require('./config/config').database;
const sessionStore = new MySQLStore({
    host: database.HOST,
    port: database.PORT,
    user: database.USER,
    password: database.PASSWORD,
    database: database.DATABASE
});

// 引入路由相关
const indexRouter = require('./routes/index');
const adminRouter = require('./routes/admin');
const lifeJobRouter = require('./routes/lifejob');
const resourceRouter = require('./routes/resource');
const activitiesRouter = require('./routes/activities');
const homeRouter = require('./routes/home');
const liveRouter = require('./routes/live');
const clientRouter = require('./routes/client');
const app = express();

// 配置模板引擎
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// 使用session持久化中间件
app.use(session({
    key: 'yqPlan',
    secret: 'yqPlan', // 加密字符串
    store: sessionStore,
    resave: true, // 强制保存session, 即使她没有变化
    saveUninitialized: true, // 强制初始化
    cookie: {maxAge: 24 * 3600 * 1000},
    // cookie: {maxAge: 1000},
    rolling: true //在每次请求时进行设置cookie，将重置cookie过期时间
}));

// 使用各种默认集成的中间件
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// 使用权限中间件
app.use(authControl);

// 使用路由中间件
app.use('/', indexRouter);
app.use('/api/auth/admin', adminRouter);
app.use('/api/auth/life_job', lifeJobRouter);
app.use('/api/auth/resource', resourceRouter);
app.use('/api/auth/activities',activitiesRouter);
app.use('/api/auth/live', liveRouter);
app.use('/api/auth/home',homeRouter);
app.use('/web', clientRouter);
// 404处理
app.use(function (req, res, next) {
    next(createError(404));
});

// 统一错误处理
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
