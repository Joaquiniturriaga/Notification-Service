module.exports = {
    PORT: process.env.PORT || 3003,
    DATABASE_URL: process.env.DATABASE_URL,
    RABBIT_URL: process.env.RABBIT_URL,
    ALERT_RADIUS_KM: parseFloat(process.env.ALERT_RADIUS_KM || '5'),
};