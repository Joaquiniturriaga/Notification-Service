const { WebSocketServer } = require('ws');
const { verifyToken } = require('./wsAuth');

// Map<userId, WebSocket>
const clients = new Map();

const initWebSocket = (server) => {
    const wss = new WebSocketServer({ server });

    wss.on('connection', (ws, req) => {
        const userId = authenticate(ws, req);
        if (!userId) return;

        clients.set(userId, ws);
        console.log(`WS connected: user ${userId} (total: ${clients.size})`);

        ws.on('close', () => {
            clients.delete(userId);
            console.log(`WS disconnected: user ${userId}`);
        });

        ws.on('error', () => clients.delete(userId));

        ws.send(JSON.stringify({ type: 'CONNECTED', message: 'Notification service ready' }));
    });

    console.log('WebSocket server initialized');
};

const authenticate = (ws, req) => {
    try {
        const url = new URL(req.url, 'ws://localhost');
        const token = url.searchParams.get('token');
        if (!token) throw new Error('No token');

        const payload = verifyToken(token);
        return payload.id;
    } catch {
        ws.close(1008, 'Unauthorized');
        return null;
    }
};

/**
 * Sends a JSON payload to a specific user if connected
 */
const sendToUser = (userId, payload) => {
    const ws = clients.get(userId);
    if (ws && ws.readyState === ws.OPEN) {
        ws.send(JSON.stringify(payload));
        return true;
    }
    return false;
};

/**
 * Returns all currently connected userIds
 */
const getConnectedUserIds = () => [...clients.keys()];

module.exports = { initWebSocket, sendToUser, getConnectedUserIds };