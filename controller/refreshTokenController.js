const prisma = require('./../DB/db.config.js');
const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.handleRefreshToken = async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) {
    res.json({
      status: 401,
      message: 'No cookie exist here',
    });
  }
  const refreshToken = cookies.jwt;
  // if given user email match another user email who is already exist in database then we
  const findUser = await prisma.user.findMany({
    where: {
      refreshToken: refreshToken,
    },
  });
  if (findUser.length === 0) {
    return res.status(403).json({
      status: 403,
      message: 'Invalid refresh token',
    });
  }
  console.log(`finduser=${JSON.stringify(findUser[0].email)}`);

  // evaluate jwt
  jwt.verify(refreshToken, process.env.REFRESS_TOKEN_SECRET, (err, decoded) => {
    if (err || findUser[0].email !== decoded.email) {
      console.error(
        'Token verification error:',
        err,
        decoded.email,
        findUser.email
      );
      return res.status(403).json({
        status: 403,
        message: 'Invalid token',
      });
    }

    const accessToken = jwt.sign(
      { email: decoded.email },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '30s' }
    );
    try {
      res.json({ accessToken });
    } catch (error) {
      console.error('Error sending response:', error);
      res.status(500).json({
        status: 500,
        message: 'Internal server error',
      });
    }
  });
};
