# AI-Ready Data Platform — Architecture Document

## System Overview

The AI-Ready Data Platform is an enterprise macroeconomic advisory system that transforms raw CSV data through a medallion architecture (Bronze → Silver → Gold) into AI-ready embeddings, enabling intelligent analysis through a RAG-powered chatbot.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           USER INTERFACE                                │
│                                                                         │
│   ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│   │Dashboard │ │ Upload   │ │ Pipeline │ │Data Exp. │ │   Chat   │   │
│   │          │ │ CSV Drop │ │ Monitor  │ │ B/S/G    │ │ RAG Bot  │   │
│   └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘   │
│        │             │            │             │            │          │
│   Next.js 16 • React 19 • Tailwind 4 • shadcn/ui • Recharts • RF     │
└────────┼─────────────┼────────────┼─────────────┼────────────┼─────────┘
         │             │            │             │            │
         ▼             ▼            ▼             ▼            ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           API GATEWAY (FastAPI)                         │
│                                                                         │
│   ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│   │/datasets │ │/pipeline │ │/quality  │ │/embed    │ │/chat     │   │
│   │ CRUD     │ │ Start/WS │ │ Scores   │ │ Stats    │ │ RAG      │   │
│   └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘   │
│        │             │            │             │            │          │
│   ┌────┴─────────────┴────────────┴─────────────┴────────────┴─────┐   │
│   │                     SERVICE LAYER                               │   │
│   │  StorageService • DatabricksService • SearchService            │   │
│   │  OpenAIService  • RAGService        • MetadataService          │   │
│   │  QualityService                                                │   │
│   └────┬─────────────┬────────────┬─────────────┬──────────────────┘   │
│        │             │            │             │                       │
│   SQLAlchemy + SQLite/PostgreSQL                                       │
└────────┼─────────────┼────────────┼─────────────┼──────────────────────┘
         │             │            │             │
         ▼             ▼            ▼             ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           AZURE CLOUD                                   │
│                                                                         │
│   ┌──────────────┐     ┌───────────────────────────────────────┐       │
│   │  ADLS Gen2   │     │     Azure Databricks (Premium)       │       │
│   │              │     │                                       │       │
│   │  raw-zone    │────▶│  01 Bronze Ingestion                 │       │
│   │  landing-zone│     │     ▼                                │       │
│   │  databricks  │     │  02 Silver Cleaning                  │       │
│   │              │     │     ▼                                │       │
│   └──────────────┘     │  03 Gold Transformation              │       │
│                         │     ▼                                │       │
│                         │  04 Quality Validation               │       │
│                         │     ▼                                │       │
│                         │  05 Feature Engineering              │       │
│                         │     ▼                                │       │
│                         │  06 Embedding Generation ───┐       │       │
│                         │     ▼                        │       │       │
│                         │  07 Vector Index Sync        │       │       │
│                         │                              │       │       │
│                         │  Unity Catalog               │       │       │
│                         │  • bronze.macro_raw          │       │       │
│                         │  • silver.macro_clean        │       │       │
│                         │  • gold.macro_analytics      │       │       │
│                         │  • features.macro_features   │       │       │
│                         │  • embeddings.macro_chunks   │       │       │
│                         │  • audit.quality_scores      │       │       │
│                         └────────────────┬─────────────┘       │       │
│                                          │                             │
│                                          ▼                             │
│   ┌──────────────────┐     ┌─────────────────────────────┐            │
│   │ Azure OpenAI     │     │ Azure AI Search              │            │
│   │                  │     │                              │            │
│   │ GPT-4o           │◀────│ macro-knowledge-index        │            │
│   │ ada-002          │     │ • HNSW vector (1536 dim)     │            │
│   │                  │     │ • BM25 full-text             │            │
│   │ Chat Completions │     │ • Semantic reranking         │            │
│   │ Embeddings       │     │ • Hybrid search              │            │
│   └──────────────────┘     └─────────────────────────────┘            │
│                                                                         │
│   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐              │
│   │  Key Vault   │   │ App Insights │   │ Data Factory │              │
│   │  Secrets     │   │ Monitoring   │   │ Orchestration│              │
│   └──────────────┘   └──────────────┘   └──────────────┘              │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Component Details

### Frontend (Next.js 16)

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Framework | Next.js 16 (App Router) | Server-side rendering, routing |
| UI Library | React 19 | Component architecture |
| Styling | Tailwind CSS 4 | Utility-first CSS |
| Components | shadcn/ui | Accessible, themed UI components |
| Charts | Recharts 3.9 | Quality radar/bar charts |
| Flow Diagram | @xyflow/react 12 | Architecture visualization |
| Data Fetching | SWR 2.4 | Stale-while-revalidate caching |
| HTTP Client | Axios | API communication |
| State | Zustand 5 | Global state management |
| Icons | Lucide React | Consistent icon set |

### Backend (FastAPI)

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Framework | FastAPI 0.110+ | Async API with OpenAPI docs |
| Language | Python 3.12 | Type hints, modern syntax |
| Validation | Pydantic 2 | Request/response schemas |
| Database | SQLAlchemy 2 | ORM for metadata storage |
| Migrations | Alembic | Schema version control |
| Logging | Loguru | Structured logging |
| Azure Storage | azure-storage-blob | ADLS Gen2 operations |
| Azure Auth | azure-identity | Managed identity / credential |
| Databricks | databricks-sdk | Job submission, status |
| Search | azure-search-documents | Hybrid vector + BM25 search |
| AI | openai (Azure) | Chat completions, embeddings |

### Azure Infrastructure (Terraform)

| Resource | SKU | Purpose |
|----------|-----|---------|
| Resource Group | — | Container for all resources |
| Storage Account | Standard_LRS, HNS | ADLS Gen2 with 3 containers |
| Databricks Workspace | Premium | Notebook execution, Unity Catalog |
| AI Search | Standard S1 | Vector index, hybrid search |
| OpenAI (Cognitive) | S0 | GPT-4o, text-embedding-ada-002 |
| Key Vault | Standard | Secrets management |
| Log Analytics | Per-GB | Centralized logging |
| Application Insights | — | APM, tracing |
| Data Factory | V2 | Pipeline orchestration (optional) |

---

## Data Flow

### 1. Upload Flow
```
User → CSV File → Frontend (Preview) → Backend (Parse) → ADLS Gen2 (raw-zone)
```

### 2. Pipeline Flow
```
ADLS raw-zone → Bronze (Raw Delta) → Silver (Clean) → Gold (Features + Chunks)
                                                            ↓
                Quality Validation ←──────────────── All Layers
                                                            ↓
                                            Feature Engineering
                                                            ↓
                                            Embedding Generation
                                                            ↓
                                            Vector Index Sync → AI Search
```

### 3. Chat/RAG Flow
```
User Question → Backend
                  ↓
          Hybrid Search (AI Search)
          • BM25 keyword match
          • Vector similarity (1536 dims)
          • Semantic reranking
                  ↓
          Top-K Context Chunks (k=5)
                  ↓
          Prompt Construction
          • System message (macroeconomic advisor persona)
          • Context injection
          • User question
                  ↓
          GPT-4o Completion
                  ↓
          Answer + Citations → Frontend
```

---

## Quality Dimensions

| Dimension | Metric | Computation |
|-----------|--------|-------------|
| **Completeness** | Non-null ratio | `count(non-null) / count(total)` per column |
| **Uniqueness** | Distinct ratio | `count(distinct) / count(total)` per key column |
| **Validity** | Range compliance | Values within expected min/max ranges |
| **Consistency** | Cross-field | Related fields agree (e.g., GDP ↔ GDP per capita) |

### Expected Progression

| Dimension | Bronze | Silver | Gold |
|-----------|--------|--------|------|
| Completeness | ~92% | ~97% | ~99% |
| Uniqueness | ~88% | ~95% | ~99% |
| Validity | ~85% | ~93% | ~98% |
| Consistency | ~80% | ~91% | ~97% |

---

## Security

- **Authentication:** Azure Active Directory / Managed Identity
- **Secrets:** Azure Key Vault (no credentials in code)
- **Network:** VNET integration for Databricks and Search
- **Data:** Encryption at rest (Azure Storage encryption) and in transit (TLS 1.2+)
- **RBAC:** Azure role assignments for least-privilege access
- **API:** API key validation on backend endpoints

---

## Performance Targets

| Metric | Target | Notes |
|--------|--------|-------|
| Pipeline throughput | 20K rows in <10 min | End-to-end Bronze→Embeddings |
| Chat latency (p95) | <5 seconds | Search + GPT-4o completion |
| Chat concurrency | 10 simultaneous users | WebSocket + connection pooling |
| Embedding generation | 100 chunks/batch | ada-002 batch API |
| Search latency | <200ms | HNSW + semantic rerank |
| Frontend load time | <2 seconds | Static generation + SWR cache |

---

## Deployment Environments

| Environment | Purpose | Infrastructure |
|-------------|---------|---------------|
| **Local** | Development | SQLite, mock services, `npm run dev` |
| **Dev** | Integration testing | Azure (minimal SKUs), Terraform dev.tfvars |
| **Staging** | Pre-production | Azure (production-like), full pipeline |
| **Production** | Live system | Azure (scaled), monitoring, alerts |

---

*Architecture document for the AI-Ready Data Platform MVP. Last updated: 2025-06-29*
