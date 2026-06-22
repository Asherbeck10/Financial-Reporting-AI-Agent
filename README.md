# FinReport AI

Upload CSV or Excel financial data and ask plain-English questions. Get answers with charts, key stats, and prose explanations — powered by Claude.

## Features

- **Drag-and-drop upload** — CSV, XLS, XLSX up to 20 MB
- **Natural language queries** — ask anything: "Show me the largest changes in client exposure this month"
- **AI-generated answers** — bar, line, and pie charts + summary stat badges + prose explanation
- **Persistent chat history** — all queries saved per dataset, available after reload
- **Paginated data table** — inspect raw rows alongside the conversation
- **Multi-dataset sidebar** — switch between uploaded files instantly

## Stack

| Layer    | Technology                                  |
| -------- | ------------------------------------------- |
| Backend  | FastAPI · SQLAlchemy async · Alembic        |
| Database | PostgreSQL 16                               |
| AI       | Anthropic Claude (`claude-sonnet-4-6`)      |
| Frontend | React 18 · TypeScript · Vite · Tailwind CSS |
| Charts   | Recharts                                    |
| State    | Zustand · React Router v6                   |
| Infra    | Docker · docker-compose                     |
| Tests    | Playwright (e2e)                            |

## Getting Started

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- An [Anthropic API key](https://console.anthropic.com/)

### 1. Configure environment

```bash
cp .env.example .env
```

Open `.env` and set your API key:

```bash
ANTHROPIC_API_KEY=sk-ant-...
```

The defaults for everything else work out of the box.

### 2. Start all services

```bash
docker compose up --build
```

This starts four containers:

| Service            | URL                          |
| ------------------ | ---------------------------- |
| Frontend           | <http://localhost:5173>      |
| Backend API        | <http://localhost:8000>      |
| API docs (Swagger) | <http://localhost:8000/docs> |
| pgAdmin            | <http://localhost:5050>      |

On first boot, Alembic runs the database migration automatically.

### 3. Use the app

1. Open <http://localhost:5173>
2. Drop a CSV or Excel file onto the upload zone
3. You're redirected to the chat view — ask anything about your data

## Production Deployment

A separate `docker-compose.prod.yml` runs the app in production mode:
- Frontend built with `npm run build` and served by **nginx on port 80**
- Backend runs **gunicorn** (2 workers) instead of `uvicorn --reload`
- No source code volume mounts — images are self-contained
- pgAdmin is excluded

### Steps

```bash
# 1. Copy and edit your env file
cp .env.example .env.prod
# Set ANTHROPIC_API_KEY, POSTGRES_PASSWORD, and ALLOWED_ORIGINS

# 2. Build and start
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build
```

### Verify it's working

| Check | URL | Expected |
| ----- | --- | -------- |
| App loads | <http://localhost> | Upload page (port 80) |
| Health endpoint | <http://localhost/health> | `{"status":"ok"}` |
| API proxy | <http://localhost/api/datasets> | JSON array |

The `/api/` path is proxied by nginx to the backend — port 8000 is not exposed publicly.

### ALLOWED_ORIGINS

Set this to your domain (comma-separated for multiple):

```bash
ALLOWED_ORIGINS=https://your-app.com
# or for local prod testing:
ALLOWED_ORIGINS=http://localhost
```

---

## Example Questions

Two sample files are included in `e2e/fixtures/` to get started immediately.

### sample_financials.xlsx

Client exposure data across 5 clients, 4 sectors, 6 months (Jan–Jun 2024).

| Question | What you get |
| -------- | ------------ |
| "Show me the largest changes in client exposure this month" | Bar chart ranked by Change MoM |
| "Which client has the highest total exposure?" | Bar chart by client + top client stat |
| "Compare MtM P&L across sectors" | Bar chart: Equities vs Fixed Income vs Derivatives vs Commodities |
| "Show Initech's exposure trend over time" | Line chart Jan–Jun |
| "What percentage of total exposure does each client hold?" | Pie chart by client |
| "Which positions have negative MtM?" | Table of losing positions |
| "Summarise the overall portfolio risk" | Prose summary + key stats |

### sample_revenue.csv

Revenue, exposure, and month-over-month change for 3 clients over 6 months.

| Question | What you get |
| -------- | ------------ |
| "What is the total revenue across all clients?" | Sum stat |
| "Compare revenue by client" | Bar chart: Acme vs Globex vs Initech |
| "Show revenue trend over months" | Line chart Jan–Jun |
| "Which month had the biggest revenue increase?" | Answer with month highlighted |
| "What percentage of revenue comes from each client?" | Pie chart |
| "Which client has the most volatile exposure?" | Analysis with Change column |

## Project Structure

```text
Financial-Reporting-AI-Agent/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app factory
│   │   ├── config.py            # Settings via pydantic-settings
│   │   ├── models/              # SQLAlchemy ORM models
│   │   ├── schemas/             # Pydantic request/response schemas
│   │   ├── routers/             # API route handlers
│   │   └── services/
│   │       ├── file_parser.py   # pandas CSV/Excel parsing
│   │       ├── dataset_service.py
│   │       ├── query_service.py
│   │       └── claude_service.py  # Anthropic SDK integration
│   └── alembic/                 # Database migrations
│
├── frontend/
│   └── src/
│       ├── api/                 # Typed API client
│       ├── components/          # UI components
│       │   ├── charts/          # Bar, Line, Pie (Recharts)
│       │   ├── chat/            # ChatInput, ChatMessage, ChatHistory
│       │   ├── data/            # DataTable
│       │   ├── layout/          # AppShell, Sidebar
│       │   └── upload/          # UploadDropzone, UploadProgress
│       ├── hooks/               # useUpload, useDatasets, useQuery
│       ├── pages/               # UploadPage, ChatPage
│       ├── store/               # Zustand global state
│       └── types/               # Shared TypeScript interfaces
│
├── e2e/
│   ├── fixtures/                # Sample CSV for tests
│   └── tests/                   # Playwright specs
│
├── docker-compose.yml
└── .env.example
```

## API Reference

| Method | Endpoint                       | Description                        |
| ------ | ------------------------------ | ---------------------------------- |
| `POST` | `/api/uploads`                 | Upload a CSV or Excel file         |
| `GET`  | `/api/datasets`                | List all datasets                  |
| `GET`  | `/api/datasets/{id}`           | Get dataset metadata               |
| `GET`  | `/api/datasets/{id}/rows`      | Paginated row data                 |
| `POST` | `/api/queries`                 | Submit a natural-language question |
| `GET`  | `/api/queries?dataset_id={id}` | Get chat history for a dataset     |
| `GET`  | `/api/queries/{id}`            | Get a specific query and result    |

Full interactive docs at <http://localhost:8000/docs>.

## Running Tests

The e2e suite hits the real running app, so Docker must be up first.

**Terminal 1 — start the app:**

```bash
docker compose up
```

**Terminal 2 — run the tests:**

```bash
cd e2e
npm install
npx playwright install chromium
npx playwright test
```

Test coverage:

- **upload.spec.ts** — file upload flow, type validation, redirect
- **chat.spec.ts** — data table rendering, question submission, chart appearance, history persistence
- **chart.spec.ts** — line and pie chart rendering for different question types

## Local Development (without Docker)

### Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# Set DATABASE_URL in your shell or a local .env
export DATABASE_URL=postgresql+asyncpg://finreport:changeme@localhost:5432/finreport_db
export ANTHROPIC_API_KEY=sk-ant-...

alembic upgrade head
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Environment Variables

| Variable              | Default                 | Description                          |
| --------------------- | ----------------------- | ------------------------------------ |
| `ANTHROPIC_API_KEY`   | —                       | **Required.** Your Anthropic API key |
| `CLAUDE_MODEL`        | `claude-sonnet-4-6`     | Model to use for queries             |
| `POSTGRES_USER`       | `finreport`             | Database user                        |
| `POSTGRES_PASSWORD`   | `changeme`              | Database password                    |
| `POSTGRES_DB`         | `finreport_db`          | Database name                        |
| `DATA_ROWS_IN_PROMPT` | `100`                   | Max rows sent to Claude per query    |
| `MAX_UPLOAD_BYTES`    | `20971520`              | Max file size (20 MB)                |
| `VITE_API_BASE_URL`   | `http://localhost:8000` | Backend URL for the frontend         |

## How the AI Layer Works

When you submit a question, the backend:

1. Fetches up to `DATA_ROWS_IN_PROMPT` rows from the dataset
2. Builds a prompt containing column metadata (types, nulls, unique counts, samples) and the raw data rows as a CSV block
3. Sends the prompt to Claude with a system message instructing it to return a strict JSON schema
4. Parses and validates the response — `answer_text`, `chart_type`, `chart_data`, `chart_config`, `summary_stats`
5. Persists the result and returns it to the frontend

For large datasets the first 100 rows are sent. Claude still has full statistical context because pandas pre-aggregates (min, max, mean, sum) are prepended for every numeric column.
