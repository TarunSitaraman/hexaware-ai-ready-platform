# AI-Ready Data Platform — Macroeconomic Advisory MVP

> **Enterprise-grade macroeconomic data platform** that transforms raw CSV data into AI-ready embeddings, enabling intelligent analysis through a RAG-powered chatbot.

[![License](https://img.shields.io/badge/license-MIT-blue.svg)]()
[![Python](https://img.shields.io/badge/python-3.12-blue.svg)]()
[![Next.js](https://img.shields.io/badge/Next.js-16-black.svg)]()
[![Terraform](https://img.shields.io/badge/Terraform-1.5+-purple.svg)]()

---

## 🏗️ Architecture Overview

```
┌─────────────┐     ┌──────────────┐     ┌──────────────────────────────────────────┐
│   Frontend   │────▶│   Backend    │────▶│              Azure Cloud                 │
│  Next.js 16  │     │  FastAPI     │     │                                          │
│  React 19    │     │  Python 3.12 │     │  ┌──────────┐  ┌───────────────────┐    │
│  Tailwind 4  │     │              │     │  │ ADLS Gen2 │  │ Databricks (Unity)│    │
│  shadcn/ui   │     │  Services:   │     │  │ Raw Zone  │  │ Bronze → Silver   │    │
│  Recharts    │     │  • Storage   │     │  │ Landing   │  │ → Gold → Features │    │
│  React Flow  │     │  • Databricks│     │  │           │  │ → Embeddings      │    │
│              │     │  • AI Search │     │  └──────────┘  └───────────────────┘    │
│              │     │  • OpenAI    │     │                                          │
│              │     │  • RAG       │     │  ┌──────────────┐  ┌────────────────┐   │
│              │     │  • Quality   │     │  │ AI Search    │  │ Azure OpenAI   │   │
│              │     │              │     │  │ Vector Index │  │ GPT-4o         │   │
│              │     │  SQLite/PG   │     │  │ Hybrid Query │  │ ada-002        │   │
└─────────────┘     └──────────────┘     │  └──────────────┘  └────────────────┘   │
                                          └──────────────────────────────────────────┘
```

### Medallion Architecture (Data Pipeline)

| Layer | Schema | Purpose |
|-------|--------|---------|
| **Bronze** | `bronze.macro_raw` | Raw ingestion with schema-on-read, metadata columns |
| **Silver** | `silver.macro_clean` | Deduplicated, typed, validated, quality-scored |
| **Gold** | `gold.macro_analytics` | Feature-engineered, text chunks for embedding |
| **Features** | `features.macro_features` | Time-series features, rolling statistics |
| **Embeddings** | `embeddings.macro_chunks` | 1536-dim vectors from ada-002 |
| **Audit** | `audit.data_quality_scores` | Quality scores across all layers |

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ (for frontend)
- **Python** 3.12+ (for backend)
- **Docker** & **Docker Compose** (optional)
- **Azure CLI** (for cloud deployment)
- **Terraform** 1.5+ (for infrastructure)

### 1. Clone & Install

```bash
# Clone the repository
git clone <repo-url>
cd ai-ready-data-platform

# Install all dependencies
make setup
# Or manually:
pip install -r backend/requirements.txt
cd frontend && npm install && cd ..
```

### 2. Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your Azure credentials (optional for local development)
# The app runs in demo/mock mode when Azure credentials are empty
```

### 3. Generate Sample Data

```bash
make seed
# Generates 20K rows of macroeconomic indicators (5.9 MB CSV)
```

### 4. Run Locally

**Option A: Docker Compose**
```bash
make run
# → Frontend: http://localhost:3000
# → Backend:  http://localhost:8000
# → API Docs: http://localhost:8000/docs
```

**Option B: Development Servers**
```bash
# Terminal 1: Backend
cd backend && uvicorn app.main:app --reload --port 8000

# Terminal 2: Frontend
cd frontend && npm run dev

# → Open http://localhost:3000
```

### 5. Walk Through the Platform

1. **Dashboard** — Overview of datasets, pipeline runs, and quality scores
2. **Upload** — Drop `macroeconomic_indicators.csv` to upload
3. **Pipeline** — Click "Start Pipeline" to process through all stages
4. **Data Explorer** — Browse Bronze, Silver, Gold layer tables
5. **Quality** — Radar charts and bar charts of quality dimensions
6. **Embeddings** — Vector stats and ad-hoc search
7. **Chat** — Ask questions about your macroeconomic data
8. **Architecture** — Interactive React Flow diagram of the platform
9. **Settings** — Configure Azure services

---

## 📁 Project Structure

```
ai-ready-data-platform/
├── frontend/                    # Next.js 16 + TypeScript + Tailwind CSS 4
│   ├── src/
│   │   ├── app/                 # 9 page routes (App Router)
│   │   │   ├── page.tsx         # Dashboard
│   │   │   ├── upload/          # File upload with CSV preview
│   │   │   ├── pipeline/        # Pipeline orchestration + WebSocket
│   │   │   ├── chat/            # RAG chatbot with citations
│   │   │   ├── architecture/    # React Flow interactive diagram
│   │   │   ├── data/[layer]/    # Data explorer (Bronze/Silver/Gold)
│   │   │   ├── quality/         # Recharts quality dashboard
│   │   │   ├── embeddings/      # Vector stats + search
│   │   │   └── settings/        # Configuration management
│   │   ├── components/
│   │   │   ├── ui/              # 15 shadcn/ui components
│   │   │   └── layout/          # Sidebar, Navbar
│   │   ├── hooks/               # Custom React hooks (SWR, WebSocket, etc.)
│   │   ├── lib/                 # API client, constants, utilities
│   │   └── types/               # TypeScript interfaces
│   ├── Dockerfile
│   └── package.json
├── backend/                     # FastAPI + Python 3.12
│   ├── app/
│   │   ├── api/v1/              # 6 API routers
│   │   ├── core/                # Config, logging, exceptions, middleware
│   │   ├── services/            # 8 service classes (Azure SDK integration)
│   │   ├── models/              # Pydantic schemas
│   │   └── db/                  # SQLAlchemy models + database setup
│   ├── tests/                   # pytest test suite
│   ├── Dockerfile
│   └── requirements.txt
├── databricks/
│   ├── notebooks/               # 7 PySpark pipeline notebooks
│   │   └── shared/              # Config, schema, utils
│   └── jobs/                    # Job orchestration definitions
├── infrastructure/
│   ├── terraform/               # 8 IaC modules + root config
│   │   ├── modules/             # Resource Group, Storage, Databricks, etc.
│   │   └── environments/        # dev.tfvars
│   └── scripts/                 # Provisioning & deployment scripts
├── sample-data/                 # Data generation scripts + sample CSV
├── docker-compose.yml           # Multi-container development setup
├── Makefile                     # Common developer commands
├── .github/workflows/ci.yml    # GitHub Actions CI pipeline
└── .env.example                 # Environment variable template
```

---

## 🔌 API Reference

The FastAPI backend provides automatic OpenAPI documentation at `http://localhost:8000/docs`.

### Key Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `GET` | `/api/v1/datasets` | List all datasets |
| `POST` | `/api/v1/datasets/upload` | Upload CSV file |
| `DELETE` | `/api/v1/datasets/{id}` | Delete dataset |
| `POST` | `/api/v1/pipeline/start` | Start pipeline run |
| `GET` | `/api/v1/pipeline/{run_id}/status` | Get run status |
| `GET` | `/api/v1/pipeline/history` | Pipeline run history |
| `WS` | `/api/v1/pipeline/ws` | WebSocket for live updates |
| `GET` | `/api/v1/quality/{dataset_id}` | Quality scores |
| `GET` | `/api/v1/quality/{id}/failed-rows` | Failed row details |
| `GET` | `/api/v1/embeddings/{dataset_id}` | Embedding stats |
| `GET` | `/api/v1/embeddings/{id}/search` | Vector search |
| `POST` | `/api/v1/chat` | RAG chatbot query |
| `GET` | `/api/v1/architecture` | Architecture state |

---

## ☁️ Azure Deployment

### 1. Provision Infrastructure

```bash
cd infrastructure/scripts
./provision.sh
```

This runs Terraform to create:
- Resource Group
- ADLS Gen2 Storage Account (3 containers)
- Azure Databricks Workspace (Premium)
- Azure AI Search (Standard S1)
- Azure OpenAI (GPT-4o + ada-002)
- Azure Key Vault
- Log Analytics + Application Insights
- Azure Data Factory (optional)

### 2. Configure Databricks

```bash
./configure_databricks.sh
```

Sets up Unity Catalog, metastore, schemas, and storage credentials.

### 3. Deploy Notebooks

```bash
./upload_notebooks.sh
```

Uploads all 7 pipeline notebooks and creates job definitions.

### 4. Update Environment

Copy Terraform outputs to `.env`:
```bash
terraform output -json | python scripts/env_from_terraform.py > .env
```

---

## 🧪 Testing

```bash
# Backend tests
cd backend && python -m pytest tests/ -v

# Frontend lint & type-check
cd frontend && npm run lint && npm run type-check

# Full test suite
make test
```

---

## 🛠️ Development

### Adding a New Page

1. Create route in `frontend/src/app/<page>/page.tsx`
2. Add nav item in `frontend/src/components/layout/sidebar.tsx`
3. Add API hook in `frontend/src/hooks/use-api.ts`
4. Create backend route in `backend/app/api/v1/<resource>.py`
5. Register in `backend/app/api/router.py`

### Adding a New Service

1. Create service class in `backend/app/services/<name>.py`
2. Add configuration to `backend/app/config.py`
3. Add to `.env.example`
4. Initialize in service registry

### Environment Variables

See [.env.example](.env.example) for all configuration options. The platform runs in **demo mode** when Azure credentials are empty, returning realistic mock data.

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

*Built with ❤️ for Hexaware's AI-Ready Data Platform initiative.*
