const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const { randomUUID } = require('node:crypto');
const { uploadsDirectory } = require('../utils/cvStorage');
const upload = require('../utils/uploadConfig');

// Checks the fixes for the SonarQube security findings (CORS, version disclosure,
// upload size limit). Uses the real Express app without connecting to MongoDB.
process.env.JWT_SECRET = process.env.JWT_SECRET || randomUUID();
const app = require('../server');

let server;
let baseURL;
before(async () => {
  await fs.mkdir(uploadsDirectory, { recursive: true });
  server = await new Promise((resolve) => {
    const listening = app.listen(0, '127.0.0.1', () => resolve(listening));
  });
  baseURL = `http://127.0.0.1:${server.address().port}`;
});
after(async () => { await new Promise((resolve) => server.close(resolve)); });

const applyWith = (bytes, filename) => {
  const form = new FormData();
  form.append('jobId', '333333333333333333333333');
  form.append('name', 'Synthetic Candidate');
  form.append('email', 'synthetic@example.test');
  form.append('cv', new Blob([bytes]), filename);
  return fetch(`${baseURL}/api/candidates/apply`, { method: 'POST', body: form });
};

test('responses do not disclose the Express version (X-Powered-By)', async () => {
  const response = await fetch(`${baseURL}/api/not-a-route`);
  assert.equal(response.headers.get('x-powered-by'), null);
});

test('CORS allows the TalentMatch client origin', async () => {
  const response = await fetch(`${baseURL}/api/not-a-route`, { headers: { Origin: 'http://localhost:3000' } });
  assert.equal(response.headers.get('access-control-allow-origin'), 'http://localhost:3000');
});

test('CORS does not allow an unknown website', async () => {
  const response = await fetch(`${baseURL}/api/not-a-route`, { headers: { Origin: 'http://untrusted.example' } });
  assert.equal(response.headers.get('access-control-allow-origin'), null);
});

test('CV upload limit is 5 MB', () => {
  assert.equal(upload.MAX_CV_SIZE_BYTES, 5 * 1024 * 1024);
});

test('a CV larger than 5 MB is rejected with 400 and a clear message', async () => {
  const response = await applyWith(Buffer.alloc(upload.MAX_CV_SIZE_BYTES + 1, 'a'), 'too-large.pdf');
  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), { message: 'The CV file must be 5 MB or smaller.' });
});

test('an unsupported file type is rejected with 400 instead of a server error', async () => {
  const response = await applyWith(Buffer.from('synthetic'), 'cv.exe');
  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), { message: 'Only PDF and DOCX files are allowed' });
});
