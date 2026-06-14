const express = require('express');
const router = express.Router();
const {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  toggleLike,
  addReply,
  deleteReply,
  getCategories
} = require('../controllers/forumController');
const { protect } = require('../middleware/auth');

router.get('/categories', getCategories);

router.route('/posts')
  .get(getPosts)
  .post(protect, createPost);

router.route('/posts/:id')
  .get(getPost)
  .put(protect, updatePost)
  .delete(protect, deletePost);

router.put('/posts/:id/like', protect, toggleLike);
router.post('/posts/:id/replies', protect, addReply);

router.delete('/replies/:id', protect, deleteReply);

module.exports = router;
