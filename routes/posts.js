const express = require('express');
const { getPosts,
    getPost,
    getPostsBySearch,
    createPost,
    updatePost,
    deletePost,
    likePost
} = require('../controllers/posts')

const auth = require('../middleware/auth');
const router = express.Router();

router.get('/', getPosts);
router.get('/search', getPostsBySearch);
router.post('/', auth, createPost);
router.patch('/:id', auth, updatePost);
router.get('/:id', auth, getPost);
router.delete('/:id', auth, deletePost);
router.patch('/:id/likePost', auth, likePost);


module.exports = router;