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
| SEC-001 | Public parent login grants access using only a student email | 1. Create a QA student. 2. Without authentication, submit `POST /api/auth/parent-login` with only that student's email. 3. Use the returned parent session to request the child's quiz results. | Parent identity and relationship must be verified before issuing a session or exposing child data. | Unauthenticated parent-login returned HTTP 200 and issued a parent session; the session successfully retrieved the student's quiz results. No parent credential or proof of relationship was required. | Critical | Runtime reproduced; fix required |
| SEC-002 | Parent result lookup writes full user documents to server logs | 1. Authenticate through parent-login for a QA student. 2. Request `GET /api/parent/quiz-results`. 3. Inspect backend console output. | Logs should not contain credentials, password hashes, or unnecessary personal data. | The controller logged complete parent and student database documents, including password-hash fields and personal identifiers. | High | Runtime reproduced; fix required |

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
