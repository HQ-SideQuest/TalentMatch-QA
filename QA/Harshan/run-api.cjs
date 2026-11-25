// Runs the real Express routes and MongoDB queries, without loading server/.env.
const { createRequire } = require('node:module');
const { randomUUID, randomBytes } = require('node:crypto');
const { mkdirSync, writeFileSync } = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const http = require('node:http');

const repoRoot = path.resolve(__dirname, '../..');
const serverRequire = createRequire(path.join(repoRoot, 'server/package.json'));
const mongoose = serverRequire('mongoose');
const dbName = 'talentmatch_member3_' + randomUUID().replaceAll('-', '');
const port = Number(process.env.MEMBER3_PORT || 5011);
const mongoHost = process.env.MEMBER3_MONGO_HOST || '127.0.0.1';
if (!['127.0.0.1', 'localhost'].includes(mongoHost)) throw new Error('Only local MongoDB is permitted.');
if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error('Invalid Member 3 port.');
process.env.MONGO_URI = `mongodb://${mongoHost}:27017/${dbName}`;
process.env.JWT_SECRET = randomBytes(48).toString('hex');

const resultDir = path.join(__dirname, 'results', new Date().toISOString().replaceAll(':', '-'));
mkdirSync(resultDir, { recursive: true });
let server;
let stopping;
async function cleanup() {
  if (stopping) return stopping;
  stopping = (async () => {
    if (server) await new Promise(resolve => server.close(resolve));
    if (mongoose.connection.readyState === 1) {
      // Never accept a user-provided DB name or reuse the demo/application DB.
      if (mongoose.connection.name !== dbName || !/^talentmatch_member3_[a-f0-9]{32}$/.test(dbName)) {
        throw new Error('Refusing cleanup: test database identity does not match.');
      }
      await mongoose.connection.dropDatabase();
    }
    await mongoose.disconnect();
  })();
  return stopping;
}
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.once(signal, async () => {
    try { await cleanup(); process.exit(130); }
    catch (error) { console.error(error.message); process.exit(1); }
  });
}

async function main() {
  const started = new Date().toISOString();
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });
  const app = serverRequire('./server.js');
  await Promise.all(['User', 'Company', 'Job'].map(model => serverRequire(`./models/${model}`).init()));
  server = await new Promise((resolve, reject) => {
    const handle = http.createServer((req, res) => {
      res.setHeader('X-TalentMatch-Test-Instance', 'member3-isolated');
      app(req, res);
    });
    handle.on('error', reject);
    handle.listen(port, '127.0.0.1', () => resolve(handle));
  });
  const baseUrl = `http://127.0.0.1:${port}/api`;
  const metadata = {
    started, baseUrl, database: dbName, node: process.version,
    platform: `${os.platform()} ${os.release()} ${os.arch()}`,
    testedCommit: process.env.TESTED_COMMIT || 'local working tree; capture git status and HEAD before submission',
    purpose: 'Real HTTP/API integration tests against an isolated MongoDB database; no UI or load test.'
  };
  writeFileSync(path.join(resultDir, 'environment.json'), JSON.stringify(metadata, null, 2));
  console.log(`Isolated API: ${baseUrl}\nDisposable database: ${dbName}`);
  if (process.argv.includes('--serve')) {
    console.log('Import the Postman collection and local environment. Run the whole collection in order. Ctrl+C cleans up this test database.');
    await new Promise(() => {});
    return;
  }
  const newman = require('newman');
  const collection = structuredClone(require('./talentmatch.postman_collection.json'));
  collection.variable.find(v => v.key === 'baseUrl').value = baseUrl;
  const environment = structuredClone(require('./local.postman_environment.json'));
  environment.values.find(variable => variable.key === 'baseUrl').value = baseUrl;
  const summary = await new Promise((resolve, reject) => {
    newman.run({ collection, environment, reporters: ['cli', 'junit'],
      reporter: { junit: { export: path.join(resultDir, 'api-results.xml') } },
      timeoutRequest: 10000, timeoutScript: 5000,
    }, (error, result) => error ? reject(error) : resolve(result));
  });
  // Raw Newman reports contain login tokens and request passwords. Persist only a compact report.
  const report = {
    ...metadata, finished: new Date().toISOString(),
    requests: summary.run.stats.requests,
    assertions: summary.run.stats.assertions,
    failures: summary.run.failures.map(f => ({ case: f.source?.name, assertion: f.error?.test, message: f.error?.message })),
    cases: summary.run.executions.map(e => ({
      name: e.item.name, method: e.request.method, status: e.response?.code,
      responseTimeMs: e.response?.responseTime,
      assertions: e.assertions?.map(a => ({ name: a.assertion, passed: !a.error, message: a.error?.message }))
    }))
  };
  writeFileSync(path.join(resultDir, 'summary.json'), JSON.stringify(report, null, 2));
  console.log(`Sanitized evidence: ${resultDir}`);
  if (report.failures.length || report.requests.failed || report.assertions.failed || report.requests.total !== collection.item.length || report.assertions.total === 0) process.exitCode = 1;
}

main().catch(error => { console.error(error); process.exitCode = 1; })
  .finally(async () => {
    try { await cleanup(); }
    catch (error) { console.error('Cleanup failed:', error.message); process.exitCode = 1; }
  });
