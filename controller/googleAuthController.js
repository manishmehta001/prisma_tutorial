const passport = require('passport');
const prisma = require('../db/db.config.js');
const jwt = require('jsonwebtoken');

require('dotenv').config();

const googleLogin = (req, res) => {
  res.render('login');
};

const googleDashboard = async (req, res) => {
  try {
    if (req.isAuthenticated()) {
      const userLogin = req.user;
      console.log('user is ===', userLogin);
      if (userLogin.active === false) {
        return res
          .status(401)
          .json({ message: 'Your account has been deactivated' });
      }
      if (userLogin) {
        const accessToken = jwt.sign(
          {
            userInfo: {
              userId: userLogin.id,
              name: userLogin.name,
            },
          },
          process.env.SECRET_KEY,
          {
            expiresIn: '10d',
          }
        );

        const refreshToken = jwt.sign(
          {
            userInfo: {
              userId: userLogin.id,
              name: userLogin.name,
            },
          },
          process.env.REFRESH_SECRET_KEY,
          {
            expiresIn: '7d',
          }
        );
        const result = await prisma.user.update({
          where: {
            id: userLogin.id,
          },
          data: {
            refreshToken: refreshToken,
          },
          include: {
            employer: true,
            jobSeeker: true,
          },
        });
        const responseData = {
          id: result.id,
          email: result.email,
          name: result.name,
        };
        console.log(responseData);
        res.cookie('userjwt', refreshToken, {
          httpOnly: true,
          maxAge: 7 * 24 * 60 * 60 * 1000,
          // secure: true,
          // sameSite: "None",
        });

        return res.status(200).json({ accessToken, result });
      }
      return res.render('dashbord', { user: req.user });
    } else {
      res.redirect('/login');
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

const getGoogleAuth = passport.authenticate('google', {
  scope: ['profile', 'email'],
});

const getGoogleAuthCallback = passport.authenticate('google', {
  failureRedirect: '/login',
  successRedirect: '/dashbord',
});

const getLinkedinAuthCallBack = passport.authenticate('linkedin', {
  successRedirect: '/profile',
  failureRedirect: '/',
});

const logout = (req, res) => {
  //   req.logout(function (err) {
  //     if (err) {
  //       console.log(err);
  //     } else {
  //       res.redirect('/login');
  //     }
  try {
    const cookies = req.cookies;
    if (!cookies?.userjwt) return res.sendStatus(204);
    res.clearCookie('userjwt', {
      httpOnly: true,
      // sameSite: "None",
      // secure: true,
    });
    res.status(200).json({ message: 'Logout Successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
  //   });
};

module.exports = {
  googleLogin,
  googleDashboard,
  getGoogleAuth,
  getGoogleAuthCallback,
  getLinkedinAuthCallBack,
  logout,
};
