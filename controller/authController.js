const { promisify } = require('util');
const prisma = require('./../DB/db.config.js');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sendEmail = require('./../middleware/email.js');
require('dotenv').config();

const aToken = (email) => {
  return jwt.sign(
    {
      email,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: '7d' }
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
exports.signupUser = async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) {
    res.json({
      status: 400,
      message: 'name, email and password are required',
    });
  }
  // if given user email match another user email who is already exist in database then we
  const findUser = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });
  if (findUser) {
    return res.json({
      message: 'Email already taken...please use another email',
    });
  }
  try {
    // encrypt the password
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        name: name,
        email: email,
        password: hashedPassword,
        role: role,
      },
    });
    if (newUser) {
      const resetURL = `${req.protocol}://${req.get(
        'host'
      )}/api/v1/auth/verifyEmail/${newUser.id}`;
      const message = `Verifie your Email? Hi ${newUser.name}, Please click here to this link ${resetURL} for your email verification!`;
      try {
        await sendEmail({
          email: newUser.email,
          subject: 'Your Email verification!)',
          message,
        });
        return res.status(200).json({
          message: 'verification link sent to email!',
        });
      } catch (error) {
        console.error(error);
      }
    }
    return res.json({
      status: 200,
      data: newUser,
      message: 'user created',
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error,
      error: error.message,
    });
  }
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
      res.json({ accessToken, status: 'success' });
    } else {
      res.status(401).json({
        message: 'passward or email not matched',
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
    const decoded = await promisify(jwt.verify)(
      token,
      process.env.ACCESS_TOKEN_SECRET
    );
    if (!decoded) {
      return res.status(401).json({
        message: 'Invalid token',
      });
    }
    console.log(decoded);
    console.log(decoded.email);
    // 3.) Check if the user exists in the database
    const freshUser = await prisma.user.findUnique({
      where: {
        email: decoded.email,
      },
    });
    if (!freshUser) {
      return res.status(401).json({
        message: 'The user belonging to this token does no longer exist',
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

exports.restrictTo = (...role) => {
  return (req, res, next) => {
    if (!role.includes(req.user.role)) {
      return res.status(403).json({
        message: 'You have not permission to performs this actions',
      });
    }
    next();
  };
};

exports.forgetPassword = async (req, res, next) => {
  const { email } = req.body;
  // 1.) Get user based on posted email
  const user = await prisma.user.findFirst({
    where: {
      email: email,
    },
  });
  if (!user) {
    return res
      .status(404)
      .json({ message: 'There is no user with this email address' });
  }
  const resetToken = crypto.randomBytes(32).toString('hex');
  const hash = crypto.createHash('sha256').update(resetToken).digest('hex');
  // const hash = await bcrypt.hash(resetToken, 10);
  console.log('resetToken is =', resetToken, 'and hash is = ');
  let passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);
  const updateUser = await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      resetToken: hash,
      passwordResetExpires: passwordResetExpires,
    },
  });
  // console.log(updateUser);
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/auth/resetPassword/${resetToken}`;
  const message = `Forgot your password? Submit a PATCH request with your new password to ${resetURL}.\nif you didn't forget your password,plese ignore this email!  `;
  try {
    await sendEmail({
      email: updateUser.email,
      subject: 'Your password reset token (valid for 10 min)',
      message,
    });
    return res.status(200).json({
      message: 'Token sent to email!',
      resetToken,
    });
  } catch (error) {
    updateUser.resetToken = undefined;
    updateUser.passwordResetExpires = undefined;
    console.error(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  // 1.) get user based on the token
  const resetToken = req.params.token;
  const hashedToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  console.log('hashed Token is ', hashedToken);
  const users = await prisma.user.findFirst({
    where: {
      resetToken: hashedToken,
      passwordResetExpires: {
        gt: new Date(Date.now()),
      },
    },
  });
  console.log('users is = ', users);
  // 2.) if token has not expired, and there is user, set the new password
  if (!users || users.length == 0) {
    return res.status(400).json({ message: 'token is invalid or has expired' });
  }

  const newPassword = req.body.password;
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  const updatedUser = await prisma.user.update({
    where: {
      id: users.id,
    },
    data: {
      password: hashedPassword,
      resetToken: null,
      passwordResetExpires: null,
    },
  });

  const token = aToken(users.email);
  res.status(200).json({
    status: 'success',
    token,
  });
};

exports.verifyEmail = async (req, res, next) => {
  const verifyId = req.params.id;
  try {
    const user = await prisma.user.findFirst({
      where: {
        id: parseInt(verifyId),
      },
    });
    if (!user || user.length == 0) {
      return res
        .status(400)
        .json({ message: 'You are not verified your email ' });
    } else {
      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          isVerifiedEmail: true,
        },
      });
    }
    return res.status(200).json({
      status: 'success',
      message: 'Email verified successfully',
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: 'Internal server error',
    });
  }
};

exports.updatePassword = async (req, res, next) => {
  const userId = req.params.id;
  const { oldPassword, newPassword } = req.body;
  try {
    const user = await prisma.user.findFirst({
      where: {
        id: parseInt(userId),
      },
    });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const match = await bcrypt.compare(oldPassword, user.password);
    if (!match) {
      return res
        .status(401)
        .json({ message: 'your old password is incorrect' });
    } else {
      hashedNewPassword = await bcrypt.hash(newPassword, 10);
      await prisma.user.update({
        where: {
          id: parseInt(userId),
        },
        data: {
          password: hashedNewPassword,
        },
      });
      return res
        .status(201)
        .json({ message: 'your password successfully updated' });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: 'internal server error',
    });
  }
};
