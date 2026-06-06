# Architecture

## Layers

- `routes/`: HTTP endpoints
- `controllers/`: request/response orchestration
- `services/`: business logic and AI orchestration
- `models/`: data shapes
- `utils/`: prompt construction and helpers

## Main Domains

- properties
- leads
- AI workflows

## Frontend Direction

Frontend pages should consume the backend through role-aware APIs for user, agent, and master flows.

