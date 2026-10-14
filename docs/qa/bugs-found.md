# QA findings

Test date: 2026-10-13

## Reproduced bugs

| ID | Title | Steps | Expected | Actual | Severity | Status |
|---|---|---|---|---|---|---|
| QA-001 | Backend startup failed while MongoDB URI was missing | 1. Run backend with the previous local environment file. 2. Request `/api/health`. 3. Add the required local MongoDB URI and JWT secret, then restart. | Backend connects to the configured database and serves health checks. | Initially startup failed and the frontend remained on its loading screen. After configuring the ignored local environment file, the backend started and `GET /api/health` returned 200. | Blocker | Resolved; configuration supplied locally |
| QA-002 | Parent signup role rejected | 1. Submit `POST /api/auth/signup` with valid full name, email, password, and `userType: parent`. | Parent signup should succeed if parent signup is a supported flow. | Request returned HTTP 400 because signup validation only accepts student and teacher roles. The separate public parent-login flow creates a parent account without a parent password. | Medium | Reproduced; design/requirements decision needed |

## Access-control and information exposure

| ID | Title | Steps | Expected | Actual | Severity | Status |
|---|---|---|---|---|---|---|
| SEC-001 | Public parent login grants access using only a student email | 1. Create a QA student. 2. Without authentication, submit `POST /api/auth/parent-login` with only that student's email. 3. Use the returned parent session to request the child's quiz results. | Parent identity and relationship must be verified before issuing a session or exposing child data. | Original exploit was runtime-reproduced: email-only login returned HTTP 200 and its session retrieved quiz results. The endpoint now requires a student-issued access code; live regression verification is blocked because the local backend failed to start and `GET /api/health` at `http://localhost:5001/api/health` remained unavailable. | Critical | Fix implemented; live regression retest blocked (backend unavailable) |
| SEC-002 | Parent result lookup writes full user documents to server logs | 1. Authenticate through parent-login for a QA student. 2. Request `GET /api/parent/quiz-results`. 3. Inspect backend console output. | Logs should not contain credentials, password hashes, or unnecessary personal data. | Original runtime reproduction recorded complete parent and student documents in logs. Parent-controller catches now log only static event messages, and request logging records the path without query strings. Live regression verification is blocked: backend startup fails because of database configuration/availability; real requests to `GET /api/health` and unauthenticated `GET /api/parent/quiz-results` received no HTTP response. | High | Fix applied; live verification blocked (backend unavailable) |

## Smoke-test results

The backend connected to Atlas and listened on port 5001. Unique QA accounts and records were used. Successful flows returned the expected statuses:

- Student and teacher signup and login — HTTP 201/200.
- Parent signup attempt — HTTP 400 (QA-002); parent-login and child-results request — HTTP 200 (SEC-001).
- Teacher class creation and student enrollment by class code — HTTP 201/200.
- Quiz creation, publishing, student start, both answers, completion, and teacher grading — HTTP 201/200.
- Overall/class rankings, student/class analytics, student/teacher notifications — HTTP 200.
- Student feedback, teacher feedback, feedback list — HTTP 201/200.
- Student rating and teacher rating statistics — HTTP 201/200.
- Student consultation request, teacher list/accept, student message, teacher completion — HTTP 201/200.
- Unauthenticated analytics and class creation probes — HTTP 401. Health, auth-check, logout, and parent-login are public; parent-login is the confirmed critical issue above.

QA accounts and test records were created in the configured Atlas database and have not been removed.

### SEC-001 fix and regression evidence

- Parent access now uses a 24-byte cryptographically random code generated only through the authenticated student's protected `/api/auth/parent-access-code` route. The student can replace the code to revoke the previous one.
- Only a SHA-256 hash is stored, excluded from normal user queries. Parent login checks the supplied code using a constant-time comparison before creating/reusing a linked parent account or issuing a session. Email-only and malformed/incorrect-code requests return HTTP 401 in the implementation.
- The parent login form requests the code, and the auth store does not log request errors that may contain the submitted credential.
- Regression requests for email-only login, incorrect-code login, and quiz-results access without a session were attempted but could not be sent: startup reported `Failed to start server; check database configuration and availability`, and the local health probe returned unavailable. They are **not** marked runtime-passed. Backend syntax checks passed and the frontend production build passed.

### SEC-002 fix and response audit evidence

- Reviewed console logging across `backend/src`: request logging now records timestamp, method, and `req.path` only (no query string, headers, or body); the other `console.log` reports only the listening port. Parent-controller exception handlers log fixed messages without exception objects or user documents. No other direct user-record/password logging was found.
- The user model marks `password` and `parentAccessCodeHash` `select: false`. The only explicit `+password` query is the credential check in login; its success response is an allowlist of profile fields. Signup, parent login, auth-check, and profile-update responses also construct allowlisted objects; other populated user references specify only public fields. A search found no API response that directly serializes a User document.
- Runtime schema check confirmed both credential fields default to excluded. Backend syntax checks passed. Real requests to `GET /api/health`, unauthenticated `GET /api/parent/quiz-results`, and empty-body `POST /api/auth/parent-login` were attempted; each got no HTTP response because the backend failed to start (`Failed to start server; check database configuration and availability`). The authenticated parent-results request and response/log inspection could not be performed and are not claimed as runtime-passed.
