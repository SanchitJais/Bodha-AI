/**
 * Integration tests for signup/login/session lifecycle.
 * Runs against a throwaway SQLite file so it never touches demo data.
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import type { Express } from 'express';

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'bodha-auth-test-'));
process.env.DATABASE_PATH = path.join(tempDir, 'test.db');

let app: Express;
let closeDatabase: () => void;

beforeAll(async () => {
  const [{ createApp }, dbModule] = await Promise.all([
    import('../app.js'),
    import('../models/db.js'),
  ]);
  app = createApp();
  closeDatabase = dbModule.closeDatabase;
});

afterAll(() => {
  closeDatabase?.();
  fs.rmSync(tempDir, { recursive: true, force: true });
});

const credentials = {
  email: 'signup-test@example.com',
  password: 'password12',
  name: 'Signup Tester',
};

describe('POST /api/auth/signup', () => {
  it('creates an account, starts a session and never returns the password hash', async () => {
    const response = await request(app).post('/api/auth/signup').send(credentials).expect(201);

    expect(response.body.user).toMatchObject({
      email: credentials.email,
      displayName: credentials.name,
      plan: 'free',
    });
    expect(response.body.user.passwordHash).toBeUndefined();
    expect(response.headers['set-cookie']?.[0]).toMatch(/bodha_session=/);
  });

  it('rejects a duplicate email with a 400', async () => {
    const response = await request(app).post('/api/auth/signup').send(credentials).expect(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
    expect(response.body.error.message).toMatch(/already exists/i);
  });

  it('rejects a password shorter than 8 characters', async () => {
    const response = await request(app)
      .post('/api/auth/signup')
      .send({ email: 'short@example.com', password: 'abc123', name: 'Short Pw' })
      .expect(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('rejects an invalid email', async () => {
    await request(app)
      .post('/api/auth/signup')
      .send({ email: 'not-an-email', password: 'password12', name: 'Bad Email' })
      .expect(400);
  });
});

describe('POST /api/auth/login', () => {
  it('signs in with the right password and starts a fresh session', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: credentials.email, password: credentials.password })
      .expect(200);

    expect(response.body.user.email).toBe(credentials.email);
    expect(response.headers['set-cookie']?.[0]).toMatch(/bodha_session=/);
  });

  it('rejects the wrong password with a 401 and a generic message', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: credentials.email, password: 'wrong-password' })
      .expect(401);
    // Deliberately vague — does not reveal whether the email exists.
    expect(response.body.error.message).toMatch(/email or password is incorrect/i);
  });

  it('rejects an unknown email with the same generic 401', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: 'password12' })
      .expect(401);
    expect(response.body.error.message).toMatch(/email or password is incorrect/i);
  });
});

describe('session lifecycle', () => {
  it('GET /me reflects the signed-in user via the session cookie, then null after logout', async () => {
    const agent = request.agent(app);
    await agent.post('/api/auth/login').send(credentials).expect(200);

    const me = await agent.get('/api/auth/me').expect(200);
    expect(me.body.user?.email).toBe(credentials.email);

    await agent.post('/api/auth/logout').expect(204);

    const loggedOut = await agent.get('/api/auth/me').expect(200);
    expect(loggedOut.body.user).toBeNull();
  });

  it('GET /credits requires a session', async () => {
    await request(app).get('/api/auth/credits').expect(401);
  });

  it('GET /credits reports the free-plan limit for a signed-in seller', async () => {
    const agent = request.agent(app);
    await agent.post('/api/auth/login').send(credentials).expect(200);

    const response = await agent.get('/api/auth/credits').expect(200);
    expect(response.body).toMatchObject({ plan: 'free', used: 0 });
    expect(response.body.limit).toBeGreaterThan(0);
  });
});

describe('POST /api/auth/onboarding', () => {
  it('requires a session', async () => {
    await request(app)
      .post('/api/auth/onboarding')
      .send({ storeName: 'Test Store', storeCity: 'Mumbai', storeCategory: 'apparel' })
      .expect(401);
  });

  it('saves the store profile and marks the seller onboarded', async () => {
    const agent = request.agent(app);
    await agent.post('/api/auth/login').send(credentials).expect(200);

    const response = await agent
      .post('/api/auth/onboarding')
      .send({ storeName: 'Test Store', storeCity: 'Mumbai', storeCategory: 'apparel' })
      .expect(200);

    expect(response.body.user).toMatchObject({
      storeName: 'Test Store',
      storeCity: 'Mumbai',
      storeCategory: 'apparel',
      onboarded: true,
    });
  });

  it('rejects an unknown store category', async () => {
    const agent = request.agent(app);
    await agent.post('/api/auth/login').send(credentials).expect(200);

    await agent
      .post('/api/auth/onboarding')
      .send({ storeName: 'Test Store', storeCity: 'Mumbai', storeCategory: 'not-a-category' })
      .expect(400);
  });
});
