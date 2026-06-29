# AI-Ready Data Platform — Demo Script

> 10-minute guided walkthrough demonstrating the full AI readiness lifecycle.

---

## Pre-Demo Setup (2 minutes)

1. **Start the platform:**
   ```bash
   # Option A: Docker
   make run
   
   # Option B: Dev servers
   cd backend && uvicorn app.main:app --reload --port 8000 &
   cd frontend && npm run dev
   ```

2. **Verify services are running:**
   - Frontend: http://localhost:3000 → Dashboard loads
   - Backend: http://localhost:8000/health → `{"status": "ok"}`
   - API Docs: http://localhost:8000/docs → Swagger UI

3. **Have sample data ready:**
   - File: `sample-data/macroeconomic_indicators.csv` (5.9 MB, 20K rows)

---

## Demo Flow

### Act 1: Welcome & Dashboard (1 minute)

**Navigate to:** http://localhost:3000

**Key talking points:**
- "This is the AI-Ready Data Platform for macroeconomic advisory"
- Show the empty state dashboard with welcome CTA
- Point out the sidebar navigation: Overview, Data Layers, AI, Platform sections
- "We'll upload raw data and transform it into AI-ready embeddings for intelligent analysis"

**Click:** "View Architecture" to show the architecture page

### Act 2: Architecture Overview (1 minute)

**Navigate to:** `/architecture`

**Key talking points:**
- Interactive React Flow diagram shows the full pipeline
- "Our medallion architecture: Upload → Ingest → Bronze → Silver → Gold → Features → Embeddings → Search → Chat"
- Color coding: blue (frontend), purple (Databricks), sky (Azure), emerald (AI)
- "All stages are currently idle — they'll light up when we run the pipeline"
- Click on a node to show details

### Act 3: Data Upload (1 minute)

**Navigate to:** `/upload`

**Actions:**
1. Drag and drop `macroeconomic_indicators.csv` onto the drop zone
2. Show the CSV preview: column badges and first 5 rows
3. Point out: "20,000 rows, 14 columns covering GDP, inflation, unemployment across countries"
4. Click "Upload & Process Dataset"
5. Watch the progress bar fill
6. Show the success screen with row count and column count
7. Click "Start Pipeline"

### Act 4: Pipeline Execution (2 minutes)

**Navigate to:** `/pipeline` (auto-redirected after upload)

**Actions:**
1. Click "Start Pipeline" if not auto-started
2. Watch each stage light up in sequence:
   - **Bronze** → Raw ingestion (20,000 rows)
   - **Silver** → Cleaning & dedup (19,240 rows — removed duplicates)
   - **Gold** → Feature engineering & chunking
   - **Features** → Time-series indicators (76,960 features)
   - **Embeddings** → Vector generation (48,100 chunks)
3. Point out the progress bar and status badges
4. Click on a completed stage to see the detail panel
5. Show the pipeline history section

**Key talking points:**
- "Each stage is a Databricks notebook running PySpark"
- "Quality improves at each layer — that's the medallion architecture advantage"
- "The pipeline runs in about 15 seconds in demo mode, 5-10 minutes in production"

### Act 5: Data Quality (1 minute)

**Navigate to:** `/quality`

**Key talking points:**
- Radar chart: "4 quality dimensions across 3 layers"
- "Bronze starts at 80-92% — raw data has gaps and duplicates"
- "Silver improves to 91-97% — cleaning and validation"
- "Gold reaches 97-99% — production-ready data quality"
- Bar chart shows per-dimension breakdown
- Quality improvement badges show progression

### Act 6: Data Explorer (1 minute)

**Navigate to:** `/data/bronze` → `/data/silver` → `/data/gold`

**Actions:**
1. Show Bronze layer: raw data with metadata columns
2. Switch to Silver: cleaned, properly typed data
3. Switch to Gold: feature-engineered with text chunks
4. Use search/filter to find specific countries
5. Sort by GDP_Growth descending
6. Export as CSV

### Act 7: Embeddings (30 seconds)

**Navigate to:** `/embeddings`

**Key talking points:**
- "48,100 text chunks embedded with OpenAI ada-002"
- "1536-dimensional vectors stored in Azure AI Search"
- "Average 312 tokens per chunk — optimized window size"
- Try a search: "US GDP growth trends"
- Show similarity scores on results

### Act 8: AI Chatbot (2 minutes)

**Navigate to:** `/chat`

**Actions:**
1. Ask: "What was the US GDP growth trend in 2024?"
2. Show the answer with citations
3. Click "Context" button to see retrieved chunks
4. Click "Prompt" button to see the full prompt sent to GPT-4o
5. Ask: "Compare inflation rates between US and EU"
6. Show citation score badges (>80% = green, <80% = amber)
7. Ask: "Which sectors showed the strongest growth?"

**Key talking points:**
- "RAG architecture: search → context → GPT-4o → citations"
- "Every answer is grounded in your data — no hallucination"
- "Citations link back to specific data chunks for transparency"
- "Token usage displayed per message for cost tracking"

### Act 9: Settings & Wrap-up (30 seconds)

**Navigate to:** `/settings`

**Key talking points:**
- "All Azure services configurable from here"
- "Service health indicators show connection status"
- "Runs in demo mode locally, connects to real Azure in production"

---

## Q&A Talking Points

- **Security:** API keys stored in Azure Key Vault, RBAC on all resources
- **Scalability:** Databricks auto-scaling clusters, Azure AI Search partitions
- **Cost:** Dev environment ~$50/day, production scales with usage
- **Timeline:** MVP in 4 weeks, production in 8 weeks
- **Extensibility:** Add new data sources by creating new Bronze ingestion notebooks

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Frontend won't start | `cd frontend && rm -rf node_modules .next && npm install` |
| Backend import errors | `pip install -r backend/requirements.txt` |
| CORS errors | Check `CORS_ORIGINS` in `.env` includes `http://localhost:3000` |
| WebSocket disconnects | Refresh the page; backend auto-reconnects |
| Empty data on pages | Click "Start Pipeline" on the Pipeline page first |
