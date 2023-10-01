const prisma = require('./../DB/db.config.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const aToken = (email) => {
  return jwt.sign(
    {
      email,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: '30s' }
  );
};
const rToken = (email) => {
  return jwt.sign(
    {
      email,
    },
    process.env.REFRESS_TOKEN_SECRET,
    { expiresIn: '1m' }
  );
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.json({
      status: 400,
      message: 'email and password are required',
    });
  }
  try {
    // if given user email match another user email who is already exist in database then we
    const findUser = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });
    if (!findUser) {
      return res.json({
        message: 'please provide a vailid email',
      }); // unauthorization
    }

    // evaluate password
    const match = await bcrypt.compare(password, findUser.password);
    if (match) {
      //create jwt
      const accessToken = aToken(findUser.email);
      const refreshToken = rToken(findUser.email);

      // Update the refreshToken in the database
      const result = await prisma.user.update({
        where: {
          email: findUser.email,
        },
        data: {
          refreshToken: refreshToken,
        },
      });
      console.log(`result is ${result}`);

      res.cookie('jwt', refreshToken, {
        httpOnly: true,
        sameSite: 'None',
        secure: true,
        maxAge: 24 * 60 * 60 * 1000,
      });
      res.json({ accessToken });
    } else {
      res.status(401).json({
        message: 'passward are not matched',
      });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      message: 'Internal server error',
    });
  }
};

exports.protects = async (req, res, next) => {
  try {
    // 1.) Getting token and check if it's there
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
      return res.status(401).json({
        message: 'You are not logged in! Please login to get access',
      });
    }
    // 2.) Verify the token
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    if (!decoded) {
      return res.status(401).json({
        message: 'Invalid token',
      });
    }

    // 3.) Check if the user exists in the database
    const freshUser = await prisma.user.findUnique({
      where: {
        email: decoded.email,
      },
    });
    if (!freshUser) {
      return res.status(401).json({
        message: 'This user does not exist',
      });
    }

    // If everything is fine, attach the user information to the request object
    req.user = freshUser;
  } catch (error) {
    return res.status(500).json({
      message: 'Internal server error',
      error: error.message,
    });
  }
  next();
};
