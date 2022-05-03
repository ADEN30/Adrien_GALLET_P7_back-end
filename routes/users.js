const express = require('express');
const ctrl = require('../controllers/users');
const auth = require('../middlewares/auth');
const multer = require('../middlewares/multer-users');

const router = express.Router();

router.post('/singup', multer, ctrl.singup);
router.post('/login', ctrl.login);
router.get('/user/profil', auth, ctrl.getUserProfile);
router.put('/user/profil', auth, ctrl.modifyUserProfile);
router.delete('/user/profil', auth, ctrl.deleteUser);

module.exports = router;