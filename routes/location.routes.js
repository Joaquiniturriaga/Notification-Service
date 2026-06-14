const router = require('express').Router();
const validateToken = require('../middlewares/validateToken.middleware');
const { updateLocation, getMyAlerts } = require('../controllers/location.controller');

router.post('/', validateToken, updateLocation);
router.get('/my', validateToken, getMyAlerts);

module.exports = router;