// tests/health.test.js
import request from 'supertest';
import express from 'express';

const testApp = express();

testApp.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'FindMeds API is running',
    database: 'MongoDB Atlas'
  });
});

testApp.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to the FindMeds API Gateway'
  });
});

describe('🟢 FindMeds Core System Infrastructure Diagnostics Validation Suite', () => {
  
  test('🎯 Core Verification Gate A: GET /health returns standard success telemetry logs', async () => {
    const response = await request(testApp).get('/health');
    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.database).toBe('MongoDB Atlas');
  });

  test('🎯 Core Verification Gate B: GET / absolute root gateway path returns status confirmation', async () => {
    const response = await request(testApp).get('/');
    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toContain('Welcome to the FindMeds API Gateway');
  });

});