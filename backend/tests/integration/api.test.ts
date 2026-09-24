import request from 'supertest';
import app from '../../src/index';

describe('Integration Tests & Performance Checks', () => {
  test('GET / responds within 3 seconds with welcome message and docs route', async () => {
    const start = Date.now();
    const res = await request(app).get('/');
    const elapsed = Date.now() - start;

    expect(res.status).toBe(200);
    expect(res.body.message).toContain('Welcome to Anaska Music API');
    expect(res.body.docs).toBe('/api/docs');
    expect(elapsed).toBeLessThan(3000); // ANS-41: under 3s
  });

  test('POST /api/auth/signup validates missing fields with 400', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ email: 'bad-email' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('POST /api/auth/login validates missing credentials with 400', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
