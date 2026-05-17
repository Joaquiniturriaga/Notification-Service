const pool = require('../config/db');

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

const reviewAlert = async (id) => {
    const { rows } = await pool.query(
        `UPDATE admin_alerts
         SET status = 'REVIEWED', reviewed_at = NOW()
         WHERE id = $1
         RETURNING *`,
        [id]
    );
    return rows[0] || null;
};

module.exports = { createAdminAlert, getAllAlerts, reviewAlert };