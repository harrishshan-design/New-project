# Klang Valley Backend

This backend is a PowerShell REST API so it can run in the current Windows-only environment without Node.js or Python.

## Run

From the project root:

```powershell
powershell -ExecutionPolicy Bypass -File .\backend\server.ps1
```

Or choose another port:

```powershell
powershell -ExecutionPolicy Bypass -File .\backend\server.ps1 -Port 9090
```

The API will start at:

```text
http://localhost:8080
```

## Demo Auth

- User password: `user123`
- Master password: `KVMASTER2026`
- Agent demo login: `60123456789` / `agent123`

Agent accounts must be verified by master before they can log in.

## Routes

- `GET /api/health`
- `POST /api/login`
- `GET /api/listings`
- `GET /api/listings/:id`
- `POST /api/listings` (master only)
- `PUT /api/listings/:id` (master only)
- `PATCH /api/listings/:id/verify` (master only)
- `GET /api/agents/active`
- `GET /api/agents` (master only)
- `POST /api/agents` (master only)
- `PUT /api/agents/:id` (master only)
- `POST /api/leads`
- `GET /api/leads` (master only)
- `GET /api/my-leads` (agent only)

## Notes

- Data is stored in [backend/data/listings.json](C:\Users\Arvind Govindasamy\Documents\New project\backend\data\listings.json)
- Agent rotation is stored in [backend/data/agents.json](C:\Users\Arvind Govindasamy\Documents\New project\backend\data\agents.json) and [backend/data/agent-rotation.json](C:\Users\Arvind Govindasamy\Documents\New project\backend\data\agent-rotation.json)
- Captured user callback requests are stored in [backend/data/leads.json](C:\Users\Arvind Govindasamy\Documents\New project\backend\data\leads.json)
- Auth tokens are in-memory for now
- This is a solid starter backend, but for production we should next add password hashing, persistent sessions/JWT, validation, and a real database
