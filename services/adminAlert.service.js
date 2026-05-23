const pool = require('../config/db');
const fetch = require('node-fetch');


const STATUS_MAP = {
    CONTROLLED:  'CONTROLLED',
    REVIEWED:    'REVIEWED',
    DISMISSED:   'DISMISSED',
    IN_PROGRESS: 'ACTIVE',
    PENDING:     'ACTIVE',
};


const createAdminAlert = async ({ report_id, report_title, lat, lng, notified_count }) => {
    const { rows } = await pool.query(
        `INSERT INTO admin_alerts (report_id, report_title, lat, lng, notified_count)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [report_id, report_title, lat, lng, notified_count]
    );
    return rows[0];
};

const getAllAlerts = async () => {
    const { rows } = await pool.query(
        'SELECT * FROM admin_alerts ORDER BY created_at DESC'
    );
    return rows;
};

const reviewAlert = async (id, status) => {
    const { rows } = await pool.query(
        `UPDATE admin_alerts
         SET status = $2, reviewed_at = NOW()
         WHERE id = $1
         RETURNING *`,
        [id, status]
    );
    const alert = rows[0] || null;
 
    if (alert && alert.report_id) {
        const reportStatus = STATUS_MAP[status] || 'ACTIVE';
        const reportUrl = process.env.REPORT_SERVICE_URL;
        if (reportUrl) {
            try {
                await fetch(`${reportUrl}/api/reports/${alert.report_id}/status`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: reportStatus }),
                });
            } catch (err) {
                console.error('Failed to sync report status:', err.message);
            }
        }
    }
 
    return alert;
};
 
module.exports = { createAdminAlert, getAllAlerts, reviewAlert };
 