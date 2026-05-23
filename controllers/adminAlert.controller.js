const { getAllAlerts, reviewAlert } = require('../services/adminAlert.service');

const getAlerts = async (req, res) => {
    try {
        const alerts = await getAllAlerts();
        res.status(200).json(alerts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const markReviewed = async (req, res) => {
    console.log('markReviewed called, id:', req.params.id, 'status:', req.body.status)

    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses  = ['REVIEWED', 'CONTROLLED', 'DISMISSED', 'IN_PROGRESS'];
        
        if (!validStatuses.includes(status)) {
            return res.status(404).json({ error: `Invalid status, Valid options: ${validStatuses.join(', ')}`});
        }

        const alert = await reviewAlert(parseInt(id), status);

        if (!alert){
            return res.status(404).json({error: 'Alert not found'});
            
        }

        res.status(200).json(alert);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getAlerts, markReviewed };