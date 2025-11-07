# Backend (Flask)

This folder contains a small Flask app that exposes a `/send` endpoint. The endpoint accepts multipart/form-data with the following fields:

- `smtp_server` (optional, default: `smtp.gmail.com`)
- `smtp_port` (optional, default: `587`)
- `sender_email` (required)
- `sender_password` (required) — use your provider app password (Gmail App Password, etc.)
- `recipients` (required) — comma/semicolon/newline separated list of recipient emails
- `subject` (optional)
- `body` (optional)
- `attachments` (optional) — file inputs (multiple allowed)

Run locally (Windows PowerShell):

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python app.py
```

The server will run on port 5000 by default. The frontend (Next.js) expects it at `http://localhost:5000`.

Security note: This demo accepts an email and app password via a POST request. Do not deploy this publicly without adding proper authentication/quotas and HTTPS. Treat app passwords like secrets and use ephemeral storage only.
