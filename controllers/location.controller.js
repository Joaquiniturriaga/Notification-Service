const { upsertLocation } = require('../services/location.service');
const { getMyNotifications } = require('../services/notificationLog.service');

const updateLocation = async (req, res) => {
    try {
        const { lat, lng } = req.body;

        if (!lat || !lng) {
            return res.status(400).json({ error: 'lat and lng are required' });
        }

        const location = await upsertLocation(req.user.id, lat, lng);
        res.status(200).json(location);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getMyAlerts = async (req, res) => {
    try {
        const logs = await getMyNotifications(req.user.id);
        res.status(200).json(logs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { updateLocation, getMyAlerts };