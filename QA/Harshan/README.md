# Harshan's API automation

The Postman collection uses names `API-00` through `API-10`, plus two setup requests. No test name uses the M3 prefix. This is the automated follow-up to the 11 manual API checks already performed.

## What changed from the manual runs

Manual evidence was collected against the QA demonstration backend on port 5001 using Batman and Clark. Keep those original screenshots and results unchanged.

Automation uses the same Express routes and database queries on port 5011, with a fresh, random local test database and a temporary signing secret. The collection registers two fictional companies for every full run. Consequently account names, company IDs, job IDs and timings differ from the manual report; these are separate runs of the same behaviours.

The first request checks a header added only by the isolated test wrapper. Other requests are skipped if this check does not succeed. Run the entire collection in the saved order. The collection cannot be used against a normal application server simply by changing its address.

The test scripts use `pm.variables` for runtime tokens and record IDs. These run-scoped values do not replace your existing Vault-backed `token` or `tokenB` environment entries. Only fictional test credentials and a local API address are in the exported files.

## Requests in order

| Request | Expected behaviour |
| --- | --- |
| API-00 | HTTP 200, JSON job array, dedicated test-server header |
| SETUP-01 | Company A and its first HR created; HTTP 201 |
| SETUP-02 | Different company B and its first HR created; HTTP 201 |
| API-01 | Wrong password rejected; HTTP 400; no token |
| API-02 | Valid login; HTTP 200; token, company and password-omission checks |
| API-03 | Job creation without a token rejected; HTTP 401 |
| API-04 | Job creation with a malformed token rejected; HTTP 401 |
| API-05 | Valid job created for company A; HTTP 201; save runtime job ID |
| API-06 | Public list contains that exact job and company; HTTP 200 |
| API-07 | Company list contains the job and every returned company ID is A; HTTP 200 |
| API-08 | Two-character title rejected; HTTP 400 |
| API-09 | Company B edit of company A job rejected; HTTP 403 |
| API-10 | Subsequent read has original title and company; HTTP 200 |

The automated job title is QA Automation Engineer; its requirements are Postman and JavaScript. The manually created QA Test Engineer job is not edited or removed by these runs.

## Run it in Postman

From the QA repository root, start the isolated server:

```powershell
npm.cmd run serve --prefix QA/Harshan
```

Keep it running while using Postman. Import `talentmatch.postman_collection.json` and select the collection. You can select the supplied `local.postman_environment.json`, or use No Environment because the collection supplies local defaults. Avoid overriding baseUrl with the normal port-5001 server.

Choose Run on the collection, keep all 13 requests selected and in order, and use one iteration. Inspect the resulting assertion pass/fail counts. An expected error response is a passing test when its assertions succeed.

The runner creates a separate temporary database. Ctrl+C stops the server and removes that runner-owned database. No API deletion request is included in the collection. If the process is forcibly killed, a disposable database can remain.

## Run the same tests from the command line

```powershell
npm.cmd test --prefix QA/Harshan
```

This starts the isolated backend, runs Newman, saves a compact JSON summary and JUnit report under ignored `results/`, stops the backend and cleans up its own database. A request error, script error, failed assertion or incomplete run makes the process fail. No application .env file is loaded or edited.

The existing GitHub Actions draft installs dependencies and runs this command. A local pass is not proof that GitHub Actions ran. The remote run and CI screenshot remain pending until the work is reviewed and pushed to HQ-SideQuest/TalentMatch-QA.

## What an assertion means

```javascript
pm.test('HTTP 401', () => pm.response.to.have.status(401));
```

The name describes the check. The function compares the real response status with the expected value. Several assertions can run for one request. Checking status alone is insufficient, so the collection also checks data, ownership, missing tokens on rejection, and unchanged state after a denied edit.

These are API integration tests: real HTTP, middleware, controllers and MongoDB. They are not browser tests, unit tests or JMeter load tests. Individual response times must not be presented as performance-test conclusions.

For the report, retain the manual screenshots separately and add an actual collection-run summary screenshot and the saved automated report. Do not include tokens, Vault exports, signing secrets or private-original screenshots in shared deliverables.
