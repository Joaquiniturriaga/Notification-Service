const pool = require('./db');

const initDB = async () => {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS user_locations (
            user_id     INTEGER PRIMARY KEY,
            lat         DECIMAL(10, 7) NOT NULL,
            lng         DECIMAL(10, 7) NOT NULL,
            updated_at  TIMESTAMP DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS notification_logs (
            id          SERIAL PRIMARY KEY,
            user_id     INTEGER NOT NULL,
            report_id   INTEGER NOT NULL,
            report_title VARCHAR(255),
            distance_km DECIMAL(6, 3),
            sent_at     TIMESTAMP DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS admin_alerts (
            id          SERIAL PRIMARY KEY,
            report_id   INTEGER NOT NULL,
            report_title VARCHAR(255),
            lat         DECIMAL(10, 7),
            lng         DECIMAL(10, 7),
            status      VARCHAR(50) DEFAULT 'PENDING',
            notified_count INTEGER DEFAULT 0,
            created_at  TIMESTAMP DEFAULT NOW(),
            reviewed_at TIMESTAMP
        );
    `);

    console.log('Notification DB tables ready');
};

module.exports = { initDB };