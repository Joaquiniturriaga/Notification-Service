const express = require('express');
const app = express();

app.use(express.json());

app.get('/', (req, res) => res.json({ status: 'ok', service: 'notification-service' }));

app.use('/api/notifications/location', require('./routes/location.routes'));
app.use('/api/notifications/admin', require('./routes/adminAlert.routes'));

module.exports = app;