const pool = require('../config/db');

const upsertLocation = async (userId, lat, lng) => {
    const { rows } = await pool.query(
        `INSERT INTO user_locations (user_id, lat, lng, updated_at)
         VALUES ($1, $2, $3, NOW())
         ON CONFLICT (user_id)
         DO UPDATE SET lat = $2, lng = $3, updated_at = NOW()
         RETURNING *`,
        [userId, lat, lng]
    );
    return rows[0];
};

const getAllLocations = async () => {
    const { rows } = await pool.query('SELECT * FROM user_locations');
    return rows;
};

module.exports = { upsertLocation, getAllLocations };