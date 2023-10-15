const prisma = require('./../DB/db.config.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.getAllUser = async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    return res.json({
      status: 200,
      message: 'successfull',
      data: users,
    });
  } catch (error) {
    return res.json({
      status: 400,
      message: error.message,
    });
  }
};
exports.getPostByUser = async (req, res) => {
  const user_id = req.params.id;
  const getPost = await prisma.user.findMany({
    where: {
      post: parseInt(user_id),
    },
  });
  return res.json({
    data: getPost,
    message: 'get successfully',
  });
};
exports.getPostByUser = async (req, res) => {
  const user_id = req.params.id;
  const getPost = await prisma.post.findMany({
    where: {
      id: parseInt(user_id),
    },
  });
  return res.json({
    data: getPost,
    message: 'get successfully',
  });
};
exports.updateUser = async (req, res) => {
  try {
    const userID = req.params.id;
    console.log(userID);
    const { name, email, password } = req.body;
    const updateUser = await prisma.user.update({
      where: {
        id: parseInt(userID),
      },
      data: {
        name: name,
        email: email,
        password: password,
      },
    });
    return res.json({
      status: 200,
      message: 'user updated successfully',
      data: {
        updateUser,
      },
    });
  } catch (error) {
    console.log(error);
    return res.json({
      status: 400,
      message: error.message,
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const userID = req.params.id;
    await prisma.user.delete({
      where: {
        id: parseInt(userID),
      },
    });
    return res.json({
      status: 200,
      message: 'user deleted successfully',
    });
  } catch (error) {
    return res.json({
      message: error.message,
    });
  }
};
