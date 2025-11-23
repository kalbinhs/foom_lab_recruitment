# foom_lab_recruitment — Quick Start for Contributors

## Clone (shallow recommended)

The repository has a large history (some large blobs such as previously-tracked node_modules). To avoid downloading the full history, prefer a shallow clone:

PowerShell (recommended):

```powershell
# shallow clone only the latest commit on main
git clone --depth 1 --branch main https://github.com/kalbinhs/foom_lab_recruitment.git
cd foom_lab_recruitment
```

If you need the full history for development or to run history-rewrite tools, clone normally:

```powershell
git clone https://github.com/kalbinhs/foom_lab_recruitment.git
cd foom_lab_recruitment
```

Note: Newer Git versions support partial clones which can also help reduce transfer size:

```powershell
git clone --filter=blob:none --depth 1 --branch main https://github.com/kalbinhs/foom_lab_recruitment.git
```

## Run (developer workflow)

This repository contains two top-level projects:
- `backend/` — Node.js + Express API
- `frontend/` — Next.js + Tailwind frontend

Open two terminals (PowerShell) and run each service separately.

Backend

```powershell
cd backend
npm install
# start backend in development mode (reads backend/package.json scripts)
npm run dev
```

Frontend

```powershell
cd frontend
npm install
# start Next.js dev server
npm run dev
```

By default the frontend expects the backend API at `/api` on the same origin when running in production. In development the frontend can proxy or call the backend URL (check the frontend code for the API base). API requests use a header `secret-key: foom123` for simple local auth.

## Troubleshooting
- If you see large clone times, retry with `--depth 1` or `--filter=blob:none` as shown above.
- If `npm run dev` fails, check the terminal output for missing environment variables or port conflicts.

## Contact
If anything is unclear, please feel free to contact me using the same email address the recruiter used to send the test.

## Note
I added several additional APIs where I felt they were needed to fully support the business functionality.

# foom_lab_recruitment
Foom Lab Inventory &amp; Purchase Request System — a Node/Express + Next.js app for managing products, warehouses, stocks and purchase requests with a lightweight REST API and a Tailwind-powered frontend.
