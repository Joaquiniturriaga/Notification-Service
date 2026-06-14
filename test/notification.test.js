jest.mock('../services/adminAlert.service', () => ({
  getAllAlerts: jest.fn().mockResolvedValue([{ id: 1, report_title: 'Incendio', status: 'PENDING' }]),
  reviewAlert:  jest.fn().mockResolvedValue({ id: 1, status: 'REVIEWED' }),
}));

jest.mock('../services/location.service', () => ({
  upsertLocation:  jest.fn().mockResolvedValue({}),
  getAllLocations:  jest.fn().mockResolvedValue([]),
}));

jest.mock('../services/notificationLog.service', () => ({
  getMyNotifications: jest.fn().mockResolvedValue([]),
  logNotification:    jest.fn().mockResolvedValue(),
}));

const request = require('supertest');
const app     = require('../app');

test('GET /api/notifications/admin - retorna lista de alertas', async () => {
  const res = await request(app).get('/api/notifications/admin');

  expect(res.statusCode).toBe(200);
  expect(Array.isArray(res.body)).toBe(true);
});

test('PUT /api/notifications/admin/1/status - status inválido → 404', async () => {
  const res = await request(app)
    .put('/api/notifications/admin/1/status')
    .send({ status: 'INVENTADO' });

  expect(res.statusCode).toBe(404);
  expect(res.body.error).toMatch('Invalid status');
});