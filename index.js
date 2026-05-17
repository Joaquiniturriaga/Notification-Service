const http = require('http');
const app = require('./app');
const { connectRabbit } = require('./config/rabbit');
const { initDB } = require('./config/db.init');
const { startConsumer } = require('./events/consumer');
const { initWebSocket } = require('./websocket/wsServer');
const config = require('./config');

const server = http.createServer(app);

const start = async () => {
    try {
        await initDB();
        await connectRabbit();
        await startConsumer();
        initWebSocket(server);

        server.listen(config.PORT, () => {
            console.log(`Notification Service running on port ${config.PORT}`);
        });
    } catch (err) {
        console.error('Fatal error starting service:', err);
        process.exit(1);
    }
};

start();