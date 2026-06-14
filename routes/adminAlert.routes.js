const router = require('express').Router();
const validateToken = require('../middlewares/validateToken.middleware');
const authorizeRole = require('../middlewares/roles.middleware');
const { getAlerts, markReviewed } = require('../controllers/adminAlert.controller');

router.get('/alerts', validateToken, authorizeRole('admin'), getAlerts);
router.put('/alerts/:id/review', validateToken, authorizeRole('admin'), markReviewed);

module.exports = router;