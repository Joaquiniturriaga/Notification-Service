const { getChannel } = require('../config/rabbit');
const { getAllLocations } = require('../services/location.service');
const { haversineKm } = require('../services/proximity.service');
const { logNotification } = require('../services/notificationLog.service');
const { createAdminAlert } = require('../services/adminAlert.service');
const { sendToUser } = require('../websocket/wsServer');
const config = require('../config');

const startConsumer = async () => {
    const channel = getChannel();

    channel.consume('reports_queue', async (msg) => {
        if (!msg) return;

        try {
            const report = JSON.parse(msg.content.toString());
            console.log(`[Consumer] New report received: ${report.id} - ${report.title}`);

            await processReport(report);
        } catch (err) {
            console.error('[Consumer] Error processing message:', err.message);
        }
    }, { noAck: true });

    console.log('[Consumer] Listening on reports_queue');
};

const processReport = async (report) => {
    const { id: reportId, title, lat, lng } = report;

    if (!lat || !lng) {
        console.warn(`[Consumer] Report ${reportId} has no coordinates, skipping proximity check`);
        return;
    }

    // Get all known user locations
    const locations = await getAllLocations();

    let notifiedCount = 0;

    for (const loc of locations) {
        const distanceKm = haversineKm(
            parseFloat(loc.lat),
            parseFloat(loc.lng),
            parseFloat(lat),
            parseFloat(lng)
        );

        if (distanceKm <= config.ALERT_RADIUS_KM) {
            const userId = loc.user_id;

            // Send real-time alert if user is connected via WebSocket
            const delivered = sendToUser(userId, {
                type: 'FIRE_ALERT',
                reportId,
                title,
                lat,
                lng,
                distanceKm: parseFloat(distanceKm.toFixed(2)),
                message: `Active fire report ${distanceKm.toFixed(1)}km from your location`,
            });

            if (delivered) notifiedCount++;

            // Always log regardless of WS connection (audit trail)
            await logNotification(userId, reportId, title, distanceKm);
        }
    }

    // Register in admin panel
    await createAdminAlert({
        report_id: reportId,
        report_title: title,
        lat,
        lng,
        notified_count: notifiedCount,
    });

    console.log(`[Consumer] Report ${reportId} processed — ${notifiedCount} users notified within ${config.ALERT_RADIUS_KM}km`);
};

module.exports = { startConsumer };