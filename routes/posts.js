const express = require('express');
const ctrl = require('../controllers/posts');
const auth = require('../middlewares/auth');
const multer = require('../middlewares/multer-posts');

const router = express.Router();

router.get('/', auth,ctrl.getAllposts);
router.delete('/', auth, ctrl.deletePosts);
router.get('/:id',auth, ctrl.getOnepost);
router.post('/',auth, multer, ctrl.createPost);
router.delete('/comment',auth, ctrl.delete_comment);
router.delete('/:id/comment',auth, ctrl.delete_comment);
router.put('/:id',auth, multer, ctrl.modifyPosts);
router.delete('/:id',auth, ctrl.deletePosts);
router.post('/like', auth, ctrl.create_like);
router.post('/comment', auth, ctrl.create_comment);




module.exports = router;