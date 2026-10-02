# Custom Furniture Brief & Lead Management System

A web application for custom-furniture businesses that helps clients explain what they need and gives the carpenter a structured brief for the first conversation and an initial project assessment.

The client selects the type of furniture, describes the space, uploads photos and drawings, chooses required services, and provides an approximate budget and timeline. The business receives the complete inquiry, contact details, and attachments in one inbox, where staff can track status and keep private notes.

## Screenshots

### Landing page

Presentation of services, selected work, materials, and the collaboration process, with a clear call to describe a new project.

![Custom furniture landing page](docs/images/pocetna.png)

### Smart brief with photos and drawings

The questionnaire guides the client through project details, services, contact information, and attachments. Existing designer plans can be uploaded, and an unfinished brief can be saved locally and continued later.

![Smart brief with photo and PDF attachment](docs/images/upitnik.png)

### Carpenter inbox

A workspace for incoming inquiries, statuses, project details, notes, and related attachments.

![Carpenter inbox with synthetic demo inquiry](docs/images/sanduce.png)

*The screenshots show the real interface in local demo mode. The name and contact information are synthetic demo data.*

## The problem

The first conversation about custom furniture often starts with incomplete information: dimensions are missing, photos arrive later, the budget is unclear, or the requested services are spread across multiple messages.

That creates unnecessary back-and-forth before the business can even understand the project.

This application collects the relevant information into one structured inquiry. It does not replace professional assessment or final on-site measurements; the carpenter still confirms the final scope and price.

## Main features

- Furniture and property type selection: apartment, house, commercial space, or other.
- Project dimensions, materials, references, approximate budget, and preferred timeline.
- Project-specific service selection, including dismantling, transport, and installation when applicable.
- Floor, elevator, delivery access, optional address, and contact details.
- Photo uploads and technical files such as drawings, sketches, or designer plans.
- Review step before submission.
- Save-and-continue-later flow for unfinished briefs on the same device and browser.
- Carpenter inbox with search, filters, statuses, private notes, and attachments.
- Demo mode for safe local testing without sending real inquiries.
- Connected Supabase mode for staff authentication, stored inquiries, private files, and server-side submission handling.

## Attachment rules

| Attachment | Supported formats | Limit |
| --- | --- | --- |
| Photos | JPG/JPEG, PNG, WEBP, HEIC/HEIF | Up to 8 files, up to 10 MB each |
| Drawings and project files | PDF, DWG, DXF, SKP and supported image formats | Up to 3 files, up to 25 MB each |

All attachments together can be up to 40 MB.

Supported images have an in-app preview. CAD and 3D files are downloaded for opening in the appropriate software.

## Demo mode

The application works without external configuration.

```bash
npm ci
npm run dev
```

Open the URL printed by Vite.

Without a local Supabase configuration, the app runs in demo mode. You can complete the brief, attach files, submit a test inquiry, and open the carpenter inbox through **Ulaz za stolara** in the footer or by adding:

```text
#/upiti
```

to the application URL.

Demo data is stored in the browser. It does not provide staff authentication and does not receive inquiries from other devices. Use synthetic data when testing.

If you already have a `.env.local` connected to your own Supabase project, keep that file when replacing project files. To temporarily switch to demo mode, set:

```text
VITE_DATA_MODE=demo
```

and restart the development server.

## Connected Supabase mode

The connected mode supports:

- Supabase authentication for staff.
- A database-backed inquiry inbox.
- Private attachments.
- Server-side brief submission through a Supabase Edge Function.
- Staff access controlled through the `staff` table.
- Database migrations and access rules stored with the project.

One Supabase project represents one furniture business.

Setup instructions are available in:

- [`POVEZIVANJE-SUPABASE.md`](POVEZIVANJE-SUPABASE.md)
- [`OBJAVLJIVANJE.md`](OBJAVLJIVANJE.md)
- [`PRIVATNOST-NACRT.md`](PRIVATNOST-NACRT.md)

The privacy document is a draft and must be completed with the real business details before production use.

## Architecture

```text
Client
  |
React smart brief
  |
Data layer
  |----------------------|
Demo mode             Supabase mode
  |                      |
IndexedDB             Edge Function
                         |
                     PostgreSQL
                         |
                  Private file storage
                         |
                   Carpenter inbox
```

## Tech stack

- React 19
- Vite
- Tailwind CSS
- Supabase
- PostgreSQL
- Supabase Auth
- Supabase Edge Functions
- IndexedDB for local drafts and demo data
- Node.js built-in test runner
- GitHub Actions / GitHub Pages workflow

## Project structure

| Path | Purpose |
| --- | --- |
| `src/components` | Landing-page sections |
| `src/config` | Business content and project configuration |
| `src/brief` | Multi-step smart brief, attachments, validation, and file rules |
| `src/inbox` | Carpenter authentication and inquiry workspace |
| `src/data` | Local persistence and service communication |
| `src/assets/images` | Website imagery |
| `supabase/migrations` | Database schema and access rules |
| `supabase/functions` | Server-side brief submission |
| `tests` | Brief, attachment, and server-flow tests |
| `docs/images` | README screenshots |

## Environment variables

Copy `.env.example` to `.env.local` only when you want to configure connected mode.

```text
VITE_DATA_MODE=demo
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_TURNSTILE_SITE_KEY=
VITE_PRIVACY_URL=
```

Never expose a Supabase `service_role` key or a Turnstile secret through a `VITE_` variable.

## Tests

Run the automated test suite with:

```bash
npm test
```

The test suite covers:

- Attachment counts, per-file limits, and total upload size.
- Disallowed file types.
- File-signature validation for images and PDFs.
- Required and optional brief fields.
- Contact validation.
- Project-specific fields and services.
- Versioned local drafts.
- Server-side validation of untrusted payloads.
- Origin restrictions.
- Duplicate submission handling.
- Upload failure cleanup.
- Recovery when the final commit response is lost.

## Build

```bash
npm run build
```

For a complete local verification:

```bash
npm run check
```

## GitHub Pages

The repository includes a GitHub Actions workflow prepared for GitHub Pages.

The workflow installs dependencies, runs the test suite, builds the application, and deploys the generated `dist` directory.

Public deployment still requires the repository Pages configuration and a final live verification. Demo mode is the recommended public portfolio mode because it does not require production business data or credentials.

## Current limitations

- Final pricing is determined by the business; automatic price calculation is intentionally not included.
- Email, SMS, and push notifications are not implemented.
- The inbox checks for new inquiries every 30 seconds while open.
- Connected mode displays up to the 200 most recent inquiries.
- Staff must sign in again after a full page refresh.
- Saved unfinished briefs stay on the same device and are never sent to the carpenter until submitted.
- Data-retention rules must be defined before production use.
- Automatic attachment deletion and antivirus scanning are not included.

## Why I built it

Custom-furniture inquiries are a good example of a process that looks simple until real clients start sending information through calls, messages, photos, drawings, and follow-up questions.

I built this project to turn that fragmented process into a structured workflow for both sides:

1. The client gets a guided way to explain the project.
2. The business gets a consistent brief instead of scattered messages.
3. Photos and technical documents stay attached to the correct inquiry.
4. The carpenter can track the inquiry through an internal workspace.

The project demonstrates frontend UX work, client-side persistence, file handling and validation, authentication, PostgreSQL/Supabase integration, server-side submission logic, and automated testing in one practical workflow.
