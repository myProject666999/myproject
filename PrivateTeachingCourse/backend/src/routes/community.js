const express = require('express');
const {
  getAllPosts,
  getPostById,
  getMyPosts,
  createPost,
  deletePost,
  toggleLike,
  addComment,
  getComments
} = require('../controllers/communityController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', getAllPosts);
router.get('/:id', getPostById);
router.get('/:postId/comments', getComments);

router.use(authenticateToken);

router.get('/me/posts', getMyPosts);
router.post('/', createPost);
router.delete('/:id', deletePost);
router.post('/:postId/like', toggleLike);
router.post('/:postId/comments', addComment);

module.exports = router;
