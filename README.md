# Student Portal (v2)

The student-facing web app for Prisma Academia schools. Students sign in with their reg number or school email, then:

- **Home**: an ID card (photo, name, reg number, programme · level), what needs attention (outstanding fees with Pay, carry-overs, missing contact details), CGPA, and the latest memos and events.
- **Payments**: fees to pay and paid fees. Pay through Paystack and download receipts.
- **Academics**: published results, CGPA, carry-overs, result slips, transcript, and course forms.
- **Updates**: memos and events (list, or calendar view).
- **Resources**: documents shared with everyone or with the student's class.
- **Profile** (from the avatar menu at the top right): contact and next-of-kin details, change password, light/dark appearance.

One codebase is deployed per school, configured by four env vars (see `.env.example`): `NEXT_PUBLIC_API_BASE_URL`, `NEXT_PUBLIC_APP_NAME`, `NEXT_PUBLIC_LOGO_URL` and `NEXT_PUBLIC_PRIMARY_COLOR`. Titles, alt text, favicon and theme colour derive from these. The primary colour drives the whole palette, including calendar tints, and the text colour placed on it is chosen for contrast (`lib/color.ts`).

## Run

```bash
npm install
cp .env.example .env.local   # then set the school's values
npm run dev                  # http://localhost:3000
```

On a slow disk, `next dev` compiles each route on first visit and can take minutes. A production build is faster to click through:

```bash
npm run build && npm run start
# or beside a running server:
NEXT_DIST_DIR=.next-preview npm run build && NEXT_DIST_DIR=.next-preview npx next start -p 3001
```

## Notes

- API calls go to `NEXT_PUBLIC_API_BASE_URL` (`lib/api/*`). PDFs (receipts, result slips, transcript, course forms) are fetched with the Bearer header and opened as blobs (`lib/api/download.ts`), so the token never appears in a URL.
- After Paystack, the gateway returns to `/payment/status?status=&reference=`. Keep that path, because the API builds the return URL from it.
- The old routes `/school` and `/resource` redirect to the new ones (`next.config.ts`).
- Design context for future UI work lives in `PRODUCT.md` and `.impeccable/`.
