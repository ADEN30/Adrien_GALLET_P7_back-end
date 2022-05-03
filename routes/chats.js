const express = require('express');
const ctrl = require('../controllers/chats');
const auth = require('../middlewares/auth');

const router = express.Router();

router.post('/:id', auth, ctrl.create_Message);
router.get('/', auth, ctrl.get_All_Salon);
router.post('/',auth, ctrl.create_salon);
router.get('/:id', auth, ctrl.get_One_Salon_with_message);

module.exports = router;