const prisma = require('./../DB/db.config.js');

exports.createComment = async (req, res) => {
  try {
    const { user_id, post_id, comment } = req.body;
    // increase comment counter
    await prisma.post.update({
      where: {
        id: parseInt(post_id),
      },
      data: {
        comment_count: {
          increment: 1,
        },
      },
    });
    const newComment = await prisma.comment.create({
      data: {
        user_id: parseInt(user_id),
        post_id: parseInt(post_id),
        comment,
      },
    });
    return res.json({
      status: 200,
      data: newComment,
      message: 'comment created',
    });
  } catch (error) {
    console.log(error);
    return res.json({
      status: 'Fail',
      error: error.message,
    });
  }
};

exports.getAllComment = async (req, res) => {
  try {
    const comment = await prisma.comment.findMany();
    return res.json({
      status: 200,
      message: 'successfull',
      data: comment,
    });
  } catch (error) {
    return res.json({
      status: 400,
      message: error.message,
    });
  }
};

exports.updateComment = async (req, res) => {
  try {
    const commentID = req.params.id;
    console.log(commentID);
    const { user_id, post_id, comment } = req.body;
    const updateComment = await prisma.comment.update({
      where: {
        id: parseInt(commentID),
      },
      data: {
        user_id: parseInt(user_id),
        post_id: parseInt(post_id),
        comment,
      },
    });
    return res.json({
      status: 200,
      message: 'comment updated successfully',
      data: {
        updateComment,
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

exports.deleteComment = async (req, res) => {
  try {
    const commentID = req.params.id;
    // decrease comment counter
    await prisma.post.update({
      where: {
        id: parseInt(post_id),
      },
      data: {
        comment_count: {
          decrement: 1,
        },
      },
    });
    await prisma.comment.delete({
      where: {
        id: parseInt(commentID),
      },
    });
    return res.json({
      status: 200,
      message: 'comment deleted successfully',
    });
  } catch (error) {
    return res.json({
      message: error.message,
    });
  }
};
