const express = require('express');
const cors = require('cors');
const userRouter = require('./router/userRoutes');
const postRouter = require('./router/postRoutes');
const commentRouter = require('./router/commentRoutes');
const authRouter = require('./router/authRoutes');
const refreshTokenRouter = require('./router/refreshRoutes');
const logoutRouter = require('./router/logoutTokenRouter');
const verifyJWT = require('./middleware/verifyJwt');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const session = require('express-session');
const path = require('path');

const app = express();

require('./middleware/passport');
app.set('view engine', 'ejs');
app.set('views', path.resolve('./views'));
app.use(
  session({
    secret: process.env.SESSION_SECRET_KEY,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);
app.use(passport.initialize());
app.use(passport.session());

// app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use((req, res, next) => {
  next();
});

app.use('/', require('./router/googleAuthRoute'));
app.use('/api/v1/post', postRouter);
app.use('/api/v1/comment', commentRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/refresh', refreshTokenRouter);
app.use('/api/v1/logout', logoutRouter);
// app.use(verifyJWT);
app.use('/api/v1/user', userRouter);

module.exports = app;
