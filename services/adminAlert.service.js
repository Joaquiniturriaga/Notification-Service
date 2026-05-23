const pool = require('../config/db');
const https = require('https');

const STATUS_MAP = {
    CONTROLLED:  'CONTROLLED',
    REVIEWED:    'REVIEWED',
    DISMISSED:   'DISMISSED',
    IN_PROGRESS: 'ACTIVE',
    PENDING:     'ACTIVE',
};

const syncReportStatus = (reportId, status) => {
    return new Promise((resolve) => {
        const reportUrl = process.env.REPORT_SERVICE_URL || ''
        const url = new URL(`/api/reports/${reportId}/status`, reportUrl)
        const data = JSON.stringify({ status })

        const options = {
            hostname: url.hostname,
            port:     url.port || 443,
            path:     url.pathname,
            method:   'PUT',
            headers: {
                'Content-Type':   'application/json',
                'Content-Length': Buffer.byteLength(data),
            },
        }

        const req = https.request(options, () => resolve())
        req.on('error', (e) => console.error('Failed to sync report status:', e.message))
        req.write(data)
        req.end()
    })
}

const createAdminAlert = async ({ report_id, report_title, lat, lng, notified_count }) => {
    const { rows } = await pool.query(
        `INSERT INTO admin_alerts (report_id, report_title, lat, lng, notified_count)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [report_id, report_title, lat, lng, notified_count]
    )
    return rows[0]
}

const getAllAlerts = async () => {
    const { rows } = await pool.query(
        'SELECT * FROM admin_alerts ORDER BY created_at DESC'
    )
    return rows
}

const reviewAlert = async (id, status) => {
    const { rows } = await pool.query(
        `UPDATE admin_alerts
         SET status = $2, reviewed_at = NOW()
         WHERE id = $1
         RETURNING *`,
        [id, status]
    )
    const alert = rows[0] || null

    if (alert && alert.report_id) {
        const reportStatus = STATUS_MAP[status] || 'ACTIVE'
        syncReportStatus(alert.report_id, reportStatus)
            .catch(err => console.error('Sync error:', err.message))
    }

    return alert
}

module.exports = { createAdminAlert, getAllAlerts, reviewAlert }