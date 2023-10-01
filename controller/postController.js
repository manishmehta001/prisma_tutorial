const prisma = require('./../DB/db.config.js');

exports.createPost = async (req, res) => {
  try {
    const { user_id, title, description } = req.body;
    const newPost = await prisma.post.create({
      data: {
        user_id: parseInt(user_id),
        title,
        description,
      },
    });
    console.log(newPost);
    return res.json({
      status: 200,
      data: newPost,
      message: 'post created',
    });
  } catch (error) {
    console.log(error);
    return res.json({
      status: 'Fail',
      error: error,
      message: error.message,
    });
  }
};

exports.getAllPost = async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      include: {
        comment: true,
      },
    });
    return res.json({
      status: 200,
      message: 'successfull',
      data: posts,
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

  const getPost = await prisma.post.findMany({
    where: {
      user_id: parseInt(user_id),
    },
  });
  return res.json({
    data: getPost,
    message: 'get successfully',
  });
};

exports.getSinglePost = async (req, res) => {
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

exports.updatePost = async (req, res) => {
  try {
    const postID = req.params.id;
    const { user_id, title, description } = req.body;
    const post = await prisma.post.findUnique({
      where: {
        id: parseInt(postID),
      },
    });

    if (!post) {
      return res.send('Post not found');
    }

    if (post.user_id === parseInt(user_id)) {
      const postUpdate = await prisma.post.update({
        where: {
          id: parseInt(postID),
        },
        data: {
          user_id: parseInt(user_id),
          title,
          description,
        },
      });
      return res.json({
        status: 200,
        message: 'user updated successfully',
        data: {
          postUpdate,
        },
      });
    } else {
      return res.json({
        message: 'you can not update this post',
      });
    }
  } catch (error) {
    console.log(error);
    return res.json({
      status: 400,
      message: error.message,
    });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const postID = req.params.id;
    await prisma.post.delete({
      where: {
        id: parseInt(postID),
      },
    });
    return res.json({
      status: 200,
      message: 'post deleted successfully',
    });
  } catch (error) {
    return res.json({
      message: error.message,
    });
  }
};
