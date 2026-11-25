# SEC 01 local fix and verification

Prepared for Harshan J.J. on 23 November 2026.

The malformed public job ID disclosure has been fixed and verified locally in HQ-SideQuest/TalentMatch-QA. No commit, push, GitHub merge, deployment or defect closure was performed.

## Change

The public getJob controller rejects IDs that are not ObjectIds or 24-character hexadecimal strings before querying MongoDB. Malformed IDs return HTTP 400 with only `{"message":"Invalid job ID"}`. Unexpected query errors return the generic HTTP 500 `Server error` response without an error field; diagnostic details are logged on the server. Existing-job retrieval and the not-found and deleting-job behaviour are preserved.

Eight regression checks were added to the existing jobController.test.js file, which is already included in the current backend test command. One older deletion test now uses a well-formed ID so it continues testing the hiding of deleting jobs rather than failing ID validation. No package or dependency change was required.

## Actual verification

| Check | Result |
| --- | --- |
| Regression against original code | Failed as expected, demonstrating missing validation and raw error disclosure |
| Focused regression after fix | 8 passed, 0 failed |
| Current QA working-folder backend suite | 257 passed, 0 failed |
| Combined reviewed PR 3 and PR 4 backend suite plus fix | 288 passed, 0 failed |
| API collection against fixed review copy | 13 requests, 48 assertions passed |
| Real HTTP and MongoDB malformed-ID retest | 400 with generic Invalid job ID response |
| Real HTTP and MongoDB existing-ID retest | 200 with correct job and populated company |
| Real HTTP and MongoDB nonexistent-ID retest | 404 with Job not found response |

The HTTP retest used the prepared QA backend in a separate test copy, an ephemeral loopback port and a fresh disposable MongoDB database. It did not use the demonstration database. Test-owned records and database were cleaned up. The current working folder also passed its own backend suite after the verified files were applied.

## Evidence and lifecycle

The original failure screenshot and source copies were preserved. The original screenshot SHA-256 is `8045b4d4d9470da11c3b9cdc26474992137122c059fbc5e36f6361879020cced`.

Detailed before/after test logs, the real HTTP response record, source backups and successful regression artifacts are saved under the ignored `QA/Harshan/results/sec01-local-fix-20261123/` directory. These are local verification records, not evidence of a hosted CI run or production deployment.

The appropriate team-register update is **Implemented and locally verified, awaiting review and integration**. The team should record the actual issue reference, assignee, review, integration and final verification when those events occur. Do not fabricate dates or mark the issue closed on the basis of an uncommitted local fix.

To capture the demonstration retest screenshot, start or restart the QA backend and send `GET http://localhost:5001/api/jobs/not-an-id` with No Auth. Expect HTTP 400 and the generic message. Save it as separate post-fix evidence; keep the original HTTP 500 screenshot unchanged.

Scope is the public single-job endpoint involved in SEC-01. This change is not a review or hardening of every controller's error handling.
