const pool = require('../config/db');

const logNotification = async (userId, reportId, reportTitle, distanceKm) => {
    await pool.query(
        `INSERT INTO notification_logs (user_id, report_id, report_title, distance_km)
         VALUES ($1, $2, $3, $4)`,
        [userId, reportId, reportTitle, distanceKm]
    );
};

const getMyNotifications = async (userId) => {
    const { rows } = await pool.query(
        `SELECT * FROM notification_logs
         WHERE user_id = $1
         ORDER BY sent_at DESC`,
        [userId]
    );
    return rows;
};

module.exports = { logNotification, getMyNotifications };