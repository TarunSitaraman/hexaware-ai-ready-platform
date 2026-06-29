# AI-Ready Data Platform MVP — Implementation Plan

> **Status Legend:** ✅ Done | 🔄 In Progress | ⬜ Not Started | ⚠️ Blocked

---

## Phase Overview

| Phase | Status | Progress | Description |
|-------|--------|----------|-------------|
| **Phase 1** | ✅ Done | 100% | Repository setup, frontend/backend scaffold, Docker, CI, sample data |
| **Phase 2** | 🔄 In Progress | ~60% | Frontend pages production-ready (Dashboard, Upload, Pipeline, Chat, Architecture, Data Explorers, Quality, Embeddings, Settings) |
| **Phase 3** | ⬜ Not Started | 0% | Backend core services (Azure SDK integration, Databricks jobs, real pipeline orchestration) |
| **Phase 4** | ⬜ Not Started | 0% | Azure infrastructure provisioning (Terraform apply, Databricks workspace, Unity Catalog) |
| **Phase 5** | ⬜ Not Started | 0% | Databricks notebooks (Bronze, Silver, Gold, Quality, Features, Embeddings, Vector Sync) |
| **Phase 6** | ⬜ Not Started | 0% | Embedding generation & vector index (Azure AI Search, text-embedding-ada-002) |
| **Phase 7** | ⬜ Not Started | 0% | RAG chatbot (hybrid search, GPT-4o, citations, context injection) |
| **Phase 8** | ⬜ Not Started | 0% | Integration testing, E2E verification, performance tuning |
| **Phase 9** | ⬜ Not Started | 0% | Deployment, documentation, demo script |

---

## Phase 1: Repository Setup & Foundation ✅ COMPLETE

| Task | Status | Notes |
|------|--------|-------|
| 1.1 Monorepo folder structure | ✅ Done | All 60+ directories created |
| 1.2 Next.js + TypeScript + Tailwind | ✅ Done | v16.2.9, App Router, standalone output |
| 1.3 shadcn/ui + Recharts + React Flow | ✅ Done | 13 components installed |
| 1.4 FastAPI + Pydantic + Azure SDKs | ✅ Done | 8 API routers, config, logging, exceptions |
| 1.5 Docker Compose (frontend + backend) | ✅ Done | `docker-compose.yml` at root |
| 1.6 GitHub Actions CI | ✅ Done | Lint, type-check, test, build |
| 1.7 Sample data generator | ✅ Done | 20K rows macroeconomic CSV (5.9 MB) |
| 1.8 Makefile + .gitignore + .env.example | ✅ Done | Common commands, proper ignores |

---

## Phase 2: Frontend Production Pages 🔄 IN PROGRESS

### Layout & Navigation
| Task | Status | Notes |
|------|--------|-------|
| 2.1 Sidebar with collapsible sections | ✅ Done | 4 sections: Overview, Data Layers, AI, Platform |
| 2.2 Navbar with breadcrumbs | ✅ Done | Dynamic from pathname |
| 2.3 Root layout + TooltipProvider | ✅ Done | `layout.tsx` wraps all pages |

### Pages

| Page | Status | Completion | Key Features Implemented | Remaining |
|------|--------|------------|-------------------------|-----------|
| **Dashboard** (`/`) | ✅ Done | 100% | Metric cards (datasets, runs, bronze/silver/gold counts), recent runs table with status badges, quality progress bars, empty state CTA | — |
| **Upload** (`/upload`) | ✅ Done | 95% | Drag-drop zone, CSV preview (5 rows + headers), column badges, progress bar, error toast, success redirect to pipeline | Add file size validation toast |
| **Pipeline** (`/pipeline`) | 🔄 In Progress | 70% | Stage cards with status icons, duration, row counts, start button, Suspense boundary | WebSocket live updates, expandable stage logs, stage detail panel |
| **Chat** (`/chat`) | 🔄 In Progress | 75% | Message bubbles, citation cards (score badges, metadata), side panels for context/prompt, empty state | Streaming tokens, message persistence, token usage display |
| **Architecture** (`/architecture`) | ⬜ Not Started | 10% | Static card grid from API | React Flow interactive diagram, live stage highlighting, click-to-inspect |
| **Data Explorers** (`/data/[layer]`) | ⬜ Not Started | 5% | Placeholder only | TanStack Table (sort, filter, paginate), schema panel, layer comparison, CSV export |
| **Quality** (`/quality`) | ⬜ Not Started | 10% | Placeholder cards | Recharts radar chart (4 dims × 3 layers), bar charts, failed rows table, trend line |
| **Embeddings** (`/embeddings`) | ⬜ Not Started | 10% | Placeholder | Stats cards, chunk viewer, ad-hoc vector search input, similarity results |
| **Settings** (`/settings`) | ⬜ Not Started | 15% | Static form | Backend-connected config, Azure service health checks, API key management |

### Components to Create
| Component | Status | Pages Using |
|-----------|--------|-------------|
| `DataTable` (TanStack) | ⬜ | Data Explorers |
| `QualityRadarChart` (Recharts) | ⬜ | Quality, Dashboard |
| `QualityBarChart` (Recharts) | ⬜ | Quality |
| `ArchitectureFlow` (React Flow) | ⬜ | Architecture |
| `StageDetailPanel` | ⬜ | Pipeline |
| `CitationCard` | ✅ | Chat |
| `ContextViewer` / `PromptViewer` | ⬜ | Chat |
| `Toast` / `Sonner` | ⬜ | All |
| `ServiceHealthIndicator` | ⬜ | Settings, Dashboard |

### Hooks & Utils to Add
| Hook/Util | Status |
|-----------|--------|
| `usePipelineWebSocket` | ⬜ |
| `useChatStreaming` | ⬜ |
| `useDebounce` | ⬜ |
| `formatDuration`, `formatNumber` | ✅ |

---

## Phase 3: Backend Core Services ⬜ NOT STARTED

### API Endpoints (FastAPI) - Status: Skeleton Only

| Endpoint | File | Current | Target |
|----------|------|---------|--------|
| `GET /health` | `main.py` | ✅ Returns `{status: ok}` | ✅ |
| `GET /api/v1/datasets` | `datasets.py` | ✅ Empty list | List with pagination, filter |
| `POST /api/v1/datasets/upload` | `datasets.py` | ✅ Returns mock ID | Multipart → ADLS Gen2 raw-zone, return preview |
| `DELETE /api/v1/datasets/{id}` | `datasets.py` | ✅ Mock response | Cascade delete (ADLS, Databricks tables, AI Search) |
| `POST /api/v1/pipeline/start` | `pipeline.py` | ✅ Mock run_id | Trigger Databricks job, return run_id |
| `GET /api/v1/pipeline/{run_id}/status` | `pipeline.py` | ✅ Mock data | Query Databricks job run status |
| `GET /api/v1/pipeline/history` | `pipeline.py` | ✅ Empty list | Query audit table |
| `GET /api/v1/pipeline/ws` | `pipeline.py` | ✅ Echo WS | Real-time status push via Databricks webhooks |
| `GET /api/v1/quality/{dataset_id}` | `quality.py` | ✅ Mock scores | Query `audit.data_quality_scores` |
| `GET /api/v1/quality/{id}/failed-rows` | `quality.py` | ✅ Empty | Query failed rows with details |
| `GET /api/v1/embeddings/{dataset_id}` | `embeddings.py` | ✅ Mock stats | Query `embeddings.macro_chunks` |
| `GET /api/v1/embeddings/{id}/search` | `embeddings.py` | ✅ Empty | Hybrid search via Azure AI Search SDK |
| `POST /api/v1/chat` | `chat.py` | ✅ Mock answer | RAG: search → context → GPT-4o → citations |
| `GET /api/v1/architecture` | `architecture.py` | ✅ Static stages | Live status from pipeline WS + Databricks |

### Services to Implement

| Service | File | Dependencies | Description |
|---------|------|--------------|-------------|
| `StorageService` | `services/storage.py` | `azure-storage-blob` | Upload to ADLS Gen2, list, delete, generate SAS |
| `DatabricksService` | `services/databricks.py` | `databricks-sdk` | Submit jobs, get run status, list jobs, webhook handling |
| `DataFactoryService` | `services/datafactory.py` | `azure-mgmt-datafactory` | Trigger ADF pipelines (optional, can skip for MVP) |
| `SearchService` | `services/search.py` | `azure-search-documents` | Index management, hybrid search, semantic rerank |
| `OpenAIService` | `services/openai.py` | `openai` | Chat completions (GPT-4o), embeddings (ada-002) |
| `RAGService` | `services/rag.py` | Search + OpenAI | Orchestrate: search → build prompt → call LLM → extract citations |
| `MetadataService` | `services/metadata.py` | SQLAlchemy + SQLite/Postgres | Track datasets, pipeline runs, quality scores |
| `QualityService` | `services/quality.py` | Databricks SQL | Query Delta tables for quality metrics |

### Database (SQLAlchemy + Alembic)
| Model | Table | Status |
|-------|-------|--------|
| `Dataset` | `datasets` | ⬜ |
| `PipelineRun` | `pipeline_runs` | ⬜ |
| `PipelineStage` | `pipeline_stages` | ⬜ |
| `QualityScore` | `quality_scores` | ⬜ |
| `ChatSession` | `chat_sessions` | ⬜ |
| `ChatMessage` | `chat_messages` | ⬜ |

---

## Phase 4: Azure Infrastructure ⬜ NOT STARTED

### Terraform Modules (Directories Exist, Content Empty)

| Module | Path | Resources | Status |
|--------|------|-----------|--------|
| Resource Group | `infrastructure/terraform/modules/resource_group` | `azurerm_resource_group` | ⬜ |
| Storage (ADLS Gen2) | `infrastructure/terraform/modules/storage` | Storage account, containers (raw, landing, databricks), HNS enabled | ⬜ |
| Data Factory | `infrastructure/terraform/modules/data_factory` | ADF v2, linked services, pipelines | ⬜ |
| Databricks | `infrastructure/terraform/modules/databricks` | Workspace (Premium), Unity Catalog metastore, cluster policy | ⬜ |
| AI Search | `infrastructure/terraform/modules/ai_search` | Search service (Standard S1), index, indexer, skillset | ⬜ |
| OpenAI | `infrastructure/terraform/modules/openai` | Cognitive Services account, GPT-4o + ada-002 deployments | ⬜ |
| Key Vault | `infrastructure/terraform/modules/keyvault` | Key Vault, secrets, access policies, RBAC | ⬜ |
| Monitoring | `infrastructure/terraform/modules/monitoring` | Log Analytics, App Insights, Action Groups, Alerts | ⬜ |

### Root Terraform
| File | Status |
|------|--------|
| `main.tf` | ⬜ |
| `variables.tf` | ⬜ |
| `outputs.tf` | ⬜ |
| `providers.tf` | ⬜ |
| `environments/dev.tfvars` | ⬜ |

### Provisioning Scripts
| Script | Path | Status |
|--------|------|--------|
| `provision.sh` | `infrastructure/scripts/` | ⬜ |
| `configure_databricks.sh` | `infrastructure/scripts/` | ⬜ (Unity Catalog, metastore, storage credentials) |
| `upload_notebooks.sh` | `infrastructure/scripts/` | ⬜ (Databricks CLI / SDK) |

---

## Phase 5: Databricks Notebooks ⬜ NOT STARTED

| Notebook | Path | Input | Output | Status |
|----------|------|-------|--------|--------|
| 01 Bronze Ingestion | `databricks/notebooks/01_bronze_ingestion.py` | CSV in landing-zone | `bronze.macro_raw` (Delta) | ⬜ |
| 02 Silver Cleaning | `databricks/notebooks/02_silver_cleaning.py` | Bronze | `silver.macro_clean` (deduped, typed, quality scored) | ⬜ |
| 03 Gold Transformation | `databricks/notebooks/03_gold_transformation.py` | Silver | `gold.macro_analytics` (features + text chunks) | ⬜ |
| 04 Quality Validation | `databricks/notebooks/04_quality_validation.py` | All layers | `audit.data_quality_scores` | ⬜ |
| 05 Feature Engineering | `databricks/notebooks/05_feature_engineering.py` | Gold | `features.macro_features` | ⬜ |
| 06 Embedding Generation | `databricks/notebooks/06_embedding_generation.py` | Gold chunks | `embeddings.macro_chunks` (with vectors) | ⬜ |
| 07 Vector Index Sync | `databricks/notebooks/07_vector_index_sync.py` | Embeddings | Azure AI Search index upsert | ⬜ |

### Job Orchestration
| Job | File | Tasks | Dependencies | Status |
|-----|------|-------|--------------|--------|
| Pipeline Orchestrator | `databricks/jobs/pipeline_orchestrator.json` | 7 notebook tasks | Sequential (Bronze → Silver → Gold → Quality → Features → Embeddings → Vector Sync) | ⬜ |
| Quality Job | `databricks/jobs/quality_job.json` | 1 task | Manual trigger | ⬜ |

### Shared Code
| File | Path | Status |
|------|------|--------|
| Config | `databricks/notebooks/shared/config.py` | ⬜ |
| Schema | `databricks/notebooks/shared/schema.py` | ⬜ |
| Utils | `databricks/notebooks/shared/utils.py` | ⬜ |

---

## Phase 6: Embeddings & Vector Search ⬜ NOT STARTED

| Task | Status | Notes |
|------|--------|-------|
| 6.1 Chunking strategy (semantic, 512 tokens, 50 overlap) | ⬜ | In Gold notebook |
| 6.2 `text-embedding-ada-002` batch generation (100/batch) | ⬜ | Pandas UDF in Embedding notebook |
| 6.3 Azure AI Search index schema (1536 dim, HNSW, semantic) | ⬜ | Terraform + indexer |
| 6.4 Hybrid search (BM25 + vector, 50/50) + semantic rerank | ⬜ | Search service |
| 6.5 Embedding stats API (chunk count, dims, model) | ⬜ | `/api/v1/embeddings/{id}` |
| 6.6 Ad-hoc vector search API | ⬜ | `/api/v1/embeddings/{id}/search` |

---

## Phase 7: RAG Chatbot ⬜ NOT STARTED

| Component | Status | Notes |
|-----------|--------|-------|
| 7.1 Hybrid search retrieval (top-k=5) | ⬜ | SearchService.hybrid_search() |
| 7.2 Prompt construction (system + context + question) | ⬜ | RAGService.build_prompt() |
| 7.3 GPT-4o streaming completion | ⬜ | OpenAIService.chat_stream() |
| 7.4 Citation extraction (chunk_id, score, metadata) | ⬜ | Return with answer |
| 7.5 Frontend streaming tokens | ⬜ | SSE / WebSocket |
| 7.6 Context viewer side panel | ⬜ | Chat page |
| 7.7 Prompt viewer side panel | ⬜ | Chat page |
| 7.7 Token usage tracking | ⬜ | DB + API response |

---

## Phase 8: Testing & Verification ⬜ NOT STARTED

| Test Type | Tool | Target | Status |
|-----------|------|--------|--------|
| Unit tests (backend) | pytest | Services, utils | ⬜ |
| Unit tests (frontend) | Vitest | Hooks, utils | ⬜ |
| Integration tests | pytest + testcontainers | API → Azure mocks | ⬜ |
| E2E tests | Playwright | Upload → Pipeline → Chat | ⬜ |
| Databricks notebook tests | Databricks Repos / pytest | Each notebook with sample data | ⬜ |
| Load test (chat) | Locust / k6 | 10 concurrent users, <5s p95 | ⬜ |
| Security scan | Trivy / Snyk | Docker images, deps | ⬜ |

---

## Phase 9: Deployment & Documentation ⬜ NOT STARTED

| Deliverable | Status |
|-------------|--------|
| Production Docker images (multi-stage) | ⬜ |
| Azure Container Apps / App Service deployment | ⬜ |
| Terraform apply to prod env | ⬜ |
| Databricks job deployment (CI/CD) | ⬜ |
| README.md (setup, run, architecture) | ⬜ |
| API_REFERENCE.md (auto-generated from OpenAPI) | ⬜ |
| DEMO_SCRIPT.md (10-min walkthrough) | ⬜ |
| ARCHITECTURE.md (this project's design doc) | ✅ Exists in conversation |
| Troubleshooting guide | ⬜ |

---

## File Structure Reference

```
ai-ready-data-platform/
├── frontend/                    # Next.js 16 + TS + Tailwind
│   ├── src/
│   │   ├── app/                 # Pages (9 routes)
│   │   ├── components/
│   │   │   ├── ui/              # 13 shadcn components
│   │   │   └── layout/          # Sidebar, Navbar, Breadcrumbs
│   │   ├── hooks/               # use-api, use-chat
│   │   ├── lib/                 # api-client, constants, utils
│   │   └── types/               # TypeScript interfaces
│   ├── Dockerfile
│   └── package.json
├── backend/                     # FastAPI + Python 3.12
│   ├── app/
│   │   ├── api/v1/              # 7 routers (datasets, pipeline, quality, embeddings, chat, architecture)
│   │   ├── core/                # config, logging, exceptions, middleware
│   │   ├── services/            # 8 services (TO IMPLEMENT)
│   │   ├── models/              # Pydantic models
│   │   └── db/                  # SQLAlchemy + Alembic (TO IMPLEMENT)
│   ├── tests/
│   ├── Dockerfile
│   └── requirements.txt
├── databricks/
│   ├── notebooks/               # 7 pipeline notebooks (TO IMPLEMENT)
│   │   └── shared/
│   ├── jobs/                    # 2 job definitions (TO IMPLEMENT)
│   └── init_scripts/
├── infrastructure/
│   ├── terraform/               # 8 modules + root (DIRS EXIST, CONTENT EMPTY)
│   └── scripts/                 # 3 provisioning scripts (TO IMPLEMENT)
├── sample-data/
│   ├── generate_data.py         # ✅ 20K row generator
│   └── macroeconomic_indicators.csv  # ✅ 5.9 MB CSV
├── docker-compose.yml           # ✅
├── Makefile                     # ✅
├── .github/workflows/ci.yml     # ✅
├── .env.example                 # ✅
└── .gitignore                   # ✅
```

---

## Quick Start for Next Developer

```bash
# 1. Install deps
make setup

# 2. Generate sample data (already done)
make seed

# 3. Run locally (2 terminals)
# Terminal 1: Backend
cd backend && uvicorn app.main:app --reload --port 8000

# Terminal 2: Frontend
cd frontend && npm run dev

# 4. Open http://localhost:3000
#    → Dashboard shows empty state
#    → Upload page: drop macroeconomic_indicators.csv
#    → Pipeline page: click "Start Pipeline" (currently mock)
#    → Chat page: ask questions (currently mock)
```

---

## Priority Order for Completion

1. **Phase 2 Remaining** — Finish Pipeline (WS), Chat (streaming), Architecture (React Flow), Data Explorers (TanStack Table), Quality (Recharts), Embeddings, Settings
2. **Phase 3** — Implement all 8 backend services with real Azure SDK calls
3. **Phase 4** — Fill Terraform modules, run `terraform apply` in dev
4. **Phase 5** — Write 7 Databricks notebooks, deploy jobs
5. **Phase 6-7** — Wire embeddings → AI Search → RAG chat
6. **Phase 8-9** — Test, document, deploy

---

*Generated for handoff to antigravity. Last updated: 2025-06-29*