// server/tests/api.test.js
const request = require('supertest');
// 1. Import both app and pool
const { app, pool } = require('../app'); 

// 2. Add this block to close the pool after tests are done
afterAll(async () => {
  await pool.end();
});

describe('Vendor API Endpoints', () => {
  it('should fetch all vendors', async () => {
    const response = await request(app).get('/api/vendors');
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body[0].name).toBe('Pizza Palace');
  });
});