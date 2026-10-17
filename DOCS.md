# Student Portal (framework-agnostic rebuild docs)

This document describes the **Student Portal frontend** in a way that lets an AI agent rebuild it in **any JS framework** (React/Vue/Svelte/Angular/etc.). It focuses on **runtime config**, **auth/session model**, **user/system flows**, and **API calls** (payloads + responses) used by the UI.

## Product scope (what the portal does)

- **Authentication**
  - Sign-in (email or registration number + password)
  - Forgot password → reset password (token link)
  - Change password (credential-based)
  - First-time setup (activate account) with required profile picture + DOB + password change
- **Home**
  - View memos (public + targeted by program/class level)
  - View calendar events (public + targeted) in a calendar/list UI
- **School**
  - Payments: view fees, pay via gateway redirect, download receipt PDF
  - Session: download course form PDFs by semester & academic year
  - Results: download result PDFs by semester & academic year
- **Resources**
  - View documents (public + targeted); open PDFs in an embedded viewer
- **Profile**
  - View/update student profile info (personal + contact)

## Runtime configuration (environment variables)

The portal reads config from Vite `import.meta.env` and **throws on missing values**.

Source: `student-portal/src/configs.js`.

### Required keys

- **API**
  - `VITE_API_BASE_URL`: Base URL for API calls (e.g. `https://api.example.com`)
- **Branding/UI**
  - `VITE_APP_NAME`
  - `VITE_APP_SHORT_NAME`
  - `VITE_PAGE_TITLE`
  - `VITE_LOGO_URL`
  - `VITE_LOGO_ALT`
  - `VITE_FAVICON_PATH`
  - `VITE_PRIMARY_COLOR` (must be 6-digit hex like `#f44336`)
  - `VITE_THEME_COLOR`
  - `VITE_MANIFEST_BG_COLOR`
  - `VITE_AUTH_BACKGROUND_URL`
  - `VITE_AUTH_BACKGROUND_URL_DARK`
  - `VITE_FOOTER_TEXT`
  - `VITE_CALENDAR_DEPARTMENT_BG`
  - `VITE_CALENDAR_DEPARTMENT_HOVER`
  - `VITE_CALENDAR_CLASS_BG`
  - `VITE_CALENDAR_CLASS_HOVER`
  - `VITE_CALENDAR_GENERAL_BG`
  - `VITE_CALENDAR_GENERAL_HOVER`

> **student-portal-v2 needs only four:** `NEXT_PUBLIC_API_BASE_URL`, `NEXT_PUBLIC_APP_NAME`,
> `NEXT_PUBLIC_LOGO_URL`, `NEXT_PUBLIC_PRIMARY_COLOR` (see `.env` and `lib/config.ts`).
> Short name, page title, logo alt, favicon, theme/manifest colours and the footer derive from
> them; the auth background images and the six calendar colours were dropped (the login uses
> the animated mesh, and calendar categories use tints of the brand palette).

## Auth & session model

### Stored state (persistent)

Source: `student-portal/src/store.jsx`.

- **Storage key**: `abcn_student_portal`
- **Fields**
  - `user`: the student object (shape depends on API; UI expects `personalInfo`, `regNumber`, `program`, `classLevel`, etc.)
  - `token`: JWT access token
  - `refreshToken`: JWT refresh token (stored; refresh flow not implemented in portal)

### How requests authenticate

Source: `student-portal/src/component/fetch.js`.

- Default requests attach:
  - `Authorization: Bearer <token>` if `token` exists
- Public requests (login/setup/forgot/reset/change password) **do not** attach Authorization.

### Global 401 behavior

If any authenticated API call returns `401`:

- Portal clears auth state (`logOut()`)
- Browser redirects to `/auth/sign-in`

## Routes (screens)

Source: `student-portal/src/router.jsx`.

- `/auth/sign-in`
- `/auth/setup`
- `/auth/forgot-password`
- `/auth/reset-password?token=...`
- `/auth/change-password`
- `/` (Home)
- `/school` (tabs: Session, Payment, Result)
- `/resource`
- `/profile`

## User & system flows

This section describes behavior without React-specific details.

### Flow: sign in

**Entry**: `/auth/sign-in`

1. User inputs:
   - `loginId` (either email containing `@` or a reg number)
   - `password`
   - `persistent` (remember me boolean)
2. Client calls `POST /api/v1/student/login` with payload:
   - If email: `{ "email": "<loginId>", "password": "...", "persistent": true|false }`
   - If reg number: `{ "regNumber": "<loginId>", "password": "...", "persistent": true|false }`
3. On success:
   - If server indicates setup is required (`redirectTo` present): navigate to `/auth/setup` and pass `student`, `token`, `refreshToken` via router state
   - Else if server indicates password change is required (`mustChangePassword === true`): navigate to `/auth/change-password` with `student`, `token`, `refreshToken`
   - Else: persist `user/token/refreshToken` and route to `/`

### Flow: first-time setup (activate account)

**Entry**: `/auth/setup` (requires router state containing `student`)

User provides:
- `currentPassword` (from onboarding/welcome email)
- `newPassword`, `confirmPassword`
- `dateOfBirth` (always `YYYY-MM-DD`, from an `<input type="date">`)
- profile picture (**required**)

Client calls `POST /api/v1/student/setup` as **multipart/form-data** (with `picture`).
The picture is required, so there is no JSON variant of this request.

On success:
- Persist `user/token/refreshToken`
- Navigate to `/`

### Flow: forgot password → reset password

**Entry**: `/auth/forgot-password`

1. User provides `email` + `regNumber`
2. Client calls `POST /api/v1/student/forgot-password`
3. Server emails a reset link pointing to `/auth/reset-password?token=<jwt>`

**Reset**: `/auth/reset-password?token=...`

1. User provides `password` + `confirmPassword`
2. Client calls `POST /api/v1/student/reset-password?token=<tokenFromUrl>`
3. On success: show success message and navigate to `/auth/sign-in`

### Flow: change password (credential-based)

**Entry**: `/auth/change-password` (may be reached after sign-in)

User provides:
- Either `email` or `regNumber`
- `currentPassword`, `newPassword`

Client calls `POST /api/v1/student/change-password`.

On success:
- Portal navigates to `/`
- If this screen was reached from sign-in and tokens were provided in router state, portal will persist them.

### Flow: home (events + memos)

**Entry**: `/`

1. Load events: `GET /api/v1/student/me/events`
2. Load memos: `GET /api/v1/student/me/memos`
3. UI renders:
   - Calendar/list of events; click event shows event details
   - Memo list; click memo shows memo content

### Flow: resources (documents + PDF viewer)

**Entry**: `/resource`

1. Load documents: `GET /api/v1/student/me/documents`
2. UI splits into tabs:
   - Public docs: `doc.isPublic === true`
   - Shared docs: not public
3. Clicking a document opens a PDF viewer using `doc.file` as URL.

### Flow: profile (view + update)

**Entry**: `/profile`

1. Load profile: `GET /api/v1/student/me`
2. Edit fields (client only):
   - `personalInfo.firstName/lastName/middleName/dateOfBirth`
   - `contactInfo.phone/email/address`
3. Save: `PATCH /api/v1/student/me` with payload `{ personalInfo, contactInfo }`
4. On success: update cached profile and update auth store `user` (keeping existing token).

### Flow: fees → pay → receipt

**Entry**: `/school` tab “Payment”

1. Load fees: `GET /api/v1/student/me/fees`
2. User opens a fee and clicks “Pay”:
   - Client calls `POST /api/v1/payment/initialize` with `{ "fee": "<feeId>" }`
   - On success, browser redirects to `authorizationUrl` (gateway hosted payment page)
3. After gateway finishes:
   - Backend gateway callback redirects to `/school` (server-side redirect)
   - UI shows the fee as paid if `fee.isPaid === true` and `fee.userPayment._id` exists
4. Receipt:
   - UI builds `GET /api/v1/student/me/receipt/<paymentId>?token=<jwt>` and navigates browser to it, expecting a **PDF download**

### Flow: download course forms

**Entry**: `/school` tab “Session”

UI generates a table of academic levels from the student’s `program.durationInYears` and `classLevel.level`.

On click “Download Form” it navigates browser to:

- `GET /api/v1/course/forms?token=<jwt>&semester=<First Semester|Second Semester>&yearId=<levelId>`

Expect: **PDF download**.

### Flow: download results

**Entry**: `/school` tab “Result”

UI generates academic years and on “Download” navigates browser to:

- `GET /api/v1/student/results?token=<jwt>&semester=<First Semester|Second Semester>&yearId=<levelId>`

Expect: **PDF download**.

> Note: this endpoint is referenced by the frontend, but it was **not found** in the `/api` service routes. See “Known mismatches” below.

## API contracts (consumer-level)

Base URL: `VITE_API_BASE_URL` (prefix paths below with it).

### Response envelope conventions

From `/api` controllers/routes, most JSON responses follow:

- **Success**
  - `{ "ok": true, "data": <any>, "message": "<string>" }` (sometimes `message` omitted)
- **Error**
  - `{ "ok": false, "message": "<string>" }` (sometimes includes `error` or `errors`)

The frontend client wrapper (`fetch.js`) normalizes responses to:

- `{ ok: true, data: <parsedJson>, message: "Request successful" }` when HTTP status is OK
- `{ ok: false, data: null, message: <serverMessageOrDerived> }` when HTTP status not OK

### Auth rules used by the backend

Source: `/api/src/middleware/auth.middleware.js`.

The backend attempts to read JWT from (in order):

1. `Authorization: Bearer <token>`
2. `req.body.token`
3. `req.query.token`

### `POST /api/v1/student/login` (public)

**Purpose**: Sign in with email or registration number.

**Request JSON**

- `{ "email": "student@example.com", "password": "secret", "persistent": true }`
- or `{ "regNumber": "ABC/123", "password": "secret", "persistent": false }`

**Success response (active account)**

- `200`
- Body:
  - `ok: true`
  - `data.token` (JWT)
  - `data.refreshToken` (JWT)
  - `data.student` (student profile)
  - `mustChangePassword` (boolean)
  - `message: "Login successful"`

**Success response (setup/pending account)**

- `200`
- Body includes:
  - `redirectTo: "<webDomain>/auth/setup"`
  - `message: "pending"`
  - `data.token/refreshToken/student`

**Error response**

- `400`
- `{ "ok": false, "message": "Student not found" | "Invalid password" | "Account is disabled." }`

### `POST /api/v1/student/setup` (public; multipart only)

**Purpose**: Activate/setup an account in `setup` status using credentials, and upload the required profile picture.

**Request (multipart/form-data)**

- Fields: `email?`, `regNumber?`, `currentPassword`, `newPassword`, `dateOfBirth`, `picture` (file)
- `dateOfBirth` must be `YYYY-MM-DD` (for example `2000-01-31`)
- `picture` is **required**; a request sent without it is rejected with `400 { "ok": false, "message": "No file found" }`

Either `email` or `regNumber` must be present (frontend may send both if available).

**Success response**

- `200`
- `{ ok: true, data: { student, token, refreshToken }, message: "Setup completed successfully" }`

**Error response (examples)**

- `400`: `{ ok: false, message: "Setup is only allowed for accounts in setup status" }`
- `400`: `{ ok: false, message: "Invalid current password" }`
- `422`: `{ ok: false, message: "missing reqiured field(s)", errors: [...] }`

### `POST /api/v1/student/forgot-password` (public)

**Purpose**: Request a reset-password email.

**Request JSON**

- `{ "email": "student@example.com", "regNumber": "ABC/123" }`

**Success**

- `200`
- `{ ok: true, message: "Reset password instruction have been sent to your email" }`

**Error**

- `400`
- `{ ok: false, message: "Student not found" }`

### `POST /api/v1/student/reset-password?token=...` (public)

**Purpose**: Reset password using token from reset link.

**Request**

- Query: `token=<jwt>`
- JSON body: `{ "password": "newPassword" }`

**Success**

- `200`
- `{ ok: true, message: "Password reset successfully" }`

**Error**

- `400`
- `{ ok: false, message: "Account not found" | "Invalid password" | "Error decoding token" }`

### `POST /api/v1/student/change-password` (public)

**Purpose**: Change password using credentials.

**Request JSON**

- Must include either `email` or `regNumber` plus:
  - `currentPassword`
  - `newPassword`

Example:

```json
{
  "email": "student@example.com",
  "currentPassword": "old",
  "newPassword": "new"
}
```

**Success**

- `200`
- `{ ok: true, message: "Password changed successfully" }`

**Error**

- `400`
- `{ ok: false, message: "Student not found" | "Invalid current password" | "Either email or regNumber is required" }`

### `GET /api/v1/student/me` (auth: student JWT)

**Purpose**: Get the current student profile.

**Headers**

- `Authorization: Bearer <token>`

**Success**

- `200`
- `{ ok: true, data: <student> }`

### `PATCH /api/v1/student/me` (auth: student JWT)

**Purpose**: Update the current student profile.

**Request JSON** (frontend sends only these keys)

```json
{
  "personalInfo": {
    "firstName": "…",
    "lastName": "…",
    "middleName": "…",
    "dateOfBirth": "YYYY-MM-DD"
  },
  "contactInfo": {
    "phone": "…",
    "email": "…",
    "address": "…"
  }
}
```

**Success**

- `200`
- `{ ok: true, data: <updatedStudent>, message: "Student updated successfully" }`

### `GET /api/v1/student/me/events` (auth: student JWT)

**Purpose**: Fetch events applicable to the student.

**Success**

- `200`
- `{ ok: true, data: [<event>...] }`

**Data expectations (frontend)**

- array items must be compatible with calendar rendering; typical event fields include `title/name`, `start`, `end`, etc. (exact shape depends on backend model)

### `GET /api/v1/student/me/memos` (auth: student JWT)

**Purpose**: Fetch memos applicable to the student.

**Success**

- `200`
- `{ ok: true, data: [<memo>...] }`

**Data expectations (frontend)**

- Each memo should include:
  - `_id`
  - `name`
  - `createdAt`
  - `isPublic`
  - `createdBy.name` (or similar; UI falls back to `"Unknown"`)
  - `programs[]` and `classLevels[]` with `.name` when populated

### `GET /api/v1/student/me/documents` (auth: student JWT)

**Purpose**: Fetch documents applicable to the student.

**Success**

- `200`
- `{ ok: true, data: [<document>...] }`

**Data expectations (frontend)**

- Each document should include:
  - `_id`
  - `title`
  - `file` (URL or path)
  - `size` (bytes)
  - `isPublic` (boolean)
  - `course.code` (optional; UI shows `"No course"` when missing)

### `GET /api/v1/student/me/fees` (auth: student JWT)

**Purpose**: Fetch fees applicable to the student, annotated with payment status.

**Success**

- `200`
- `{ ok: true, data: [<feeWithStatus>...] }`

**Fee data expectations (frontend)**

The UI reads:

- `_id`, `name`, `amount`, `dueDate`
- `items[]` with `{ name, quantity, price }` (optional)
- `isPaid` (boolean)
- `userPayment._id` (when paid; used for receipt downloads)

### `POST /api/v1/payment/initialize` (auth: JWT)

**Purpose**: Initialize a payment for a fee and return a gateway authorization URL.

**Request JSON**

- `{ "fee": "<feeId>" }`

**Success**

- `200`
- `{ ok: true, data: { payment, authorizationUrl, reference }, message: "Payment initialized successfully" }`

**Client behavior**

- Browser navigates to `authorizationUrl` (full redirect).

### `GET /api/v1/student/me/receipt/:id` (file download; auth: student JWT)

**Purpose**: Download a PDF receipt for the logged-in student’s payment (same PDF pipeline as staff `payment/receipt`; scoped so the payment belongs to this student).

**Request**

- Path param: `:id` is `paymentId` (the portal uses `fee.userPayment._id`)
- Auth: `verifyStudentToken` — `Authorization: Bearer <studentJwt>` OR `?token=<studentJwt>`

**Success**

- `200`
- Response: `application/pdf` bytes

### `GET /api/v1/payment/receipt/:id` (staff; file download)

**Purpose**: Staff/console PDF receipt (`verifyToken` + `VIEW_PAYMENT`). Not used by student-portal-v2; students use `/api/v1/student/me/receipt/:id` above.

### `GET /api/v1/course/forms` (file download; auth: JWT + permission)

**Purpose**: Download a course form PDF.

**Request query**

- `token=<jwt>` (portal uses query token)
- `semester=First Semester|Second Semester`
- `yearId=<string>` (portal uses the generated level ID like `"100"`, `"200"`, ...)

**Success**

- `200`
- Response: `application/pdf` bytes

### `GET /api/v1/student/results` (file download; expected by frontend)

**Purpose**: Download a result PDF.

**Request query**

- `token=<jwt>`
- `semester=First Semester|Second Semester`
- `yearId=<string>`

**Expected success**

- `200`
- Response: `application/pdf` bytes

> This endpoint is **not implemented in `/api`** (as of current repo state). See “Known mismatches”.

## Minimal data model assumptions (what the UI needs)

To rebuild the UI, your frontend data layer should support at least:

- **Student**
  - `_id`
  - `regNumber`
  - `email`
  - `picture` (path relative to API base URL, optional)
  - `personalInfo.firstName/lastName/middleName/dateOfBirth`
  - `contactInfo.phone/email/address`
  - `program.name`, `program.durationInYears`
  - `classLevel.level`
  - `enrollmentDate` (used only for client-side academic year generation)
- **Memo**
  - `_id`, `name`, `createdAt`, `isPublic`
  - `createdBy.name` (or compose name fields)
  - `programs[].name`, `classLevels[].name` (optional)
- **Event**
  - fields usable by calendar display (title + start/end at minimum)
- **Document**
  - `_id`, `title`, `file`, `size`, `isPublic`
  - `course.code` optional
- **Fee**
  - `_id`, `name`, `amount`, `dueDate`, `items[]`
  - `isPaid` boolean
  - `userPayment._id` when paid

## Known mismatches / rebuild notes

1. **Results download endpoint missing in `/api`**
   - Frontend navigates to `GET /api/v1/student/results?...`
   - `/api/src/route/student.route.js` does not define this route.
   - Rebuild options:
     - Implement `GET /api/v1/student/results` in `/api` (recommended if this portal is the primary student-facing frontend), or
     - Change the portal to use the actual backend route that returns result PDFs (if it exists elsewhere), or
     - Add a proxy endpoint that maps `(yearId, semester)` to the existing result PDF generator.

2. **Some PDF endpoints still use staff auth (`checkPermission`)**
   - Fee receipts: the portal uses **`/api/v1/student/me/receipt/:id`** with the student JWT (see `student.route.js`).
   - **`/api/v1/course/forms`** is still protected by `verifyToken` + `checkPermission(...)` in `/api` routes.
   - The portal calls course forms using the **student token** via query `token=...`; if that fails for students, prefer **`/api/v1/student/me/course-form`** (student JWT) or adjust permissions.

3. **Token refresh**
   - Frontend stores `refreshToken` but does not implement refresh/renew flows.
   - If access tokens are short-lived, the rebuild should implement refresh (or rely on longer-lived access tokens).

