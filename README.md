# GrowEasy AI CSV Importer

An AI-powered CSV Importer that extracts CRM lead information from any valid CSV format.

## Architecture
- **Frontend**: Next.js, Tailwind CSS, Lucide React
- **Backend**: Django, Django REST Framework, LangChain, Pydantic, Tenacity (Retries)
- **AI Model**: GPT-4o via OpenRouter

## Features Implemented
- [x] Drag & Drop CSV Upload (via standard inputs, can be enhanced with dropzone)
- [x] Resilient AI Parsing with auto-retries for failed LangChain batches
- [x] Modern UI matching Figma/Reference designs
- [x] Deployment configurations for Vercel & Render
- [x] Docker & Docker Compose setup for local development

## Setup Instructions

### Local Development (Docker - Recommended)

1. Ensure you have Docker and Docker Compose installed.
2. In the root directory, create `.env` in the `backend/` folder:
   ```
   OPENROUTER_API_KEY=your_key_here
   ```
3. Run the following command:
   ```bash
   docker-compose up --build
   ```
4. Access the frontend at `http://localhost:5173`

### Local Development (Manual)

#### Backend
```bash
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python manage.py runserver
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Bonus Points Completed
- **Retry Mechanism**: The backend uses `tenacity` to retry failed API calls to the LLM up to 3 times before skipping the batch.
- **Docker Setup**: Unified `docker-compose.yml` and individual Dockerfiles provided.
- **Deployment Ready**: Included `vercel.json` and `render.yaml` configurations.

## Architecture Diagrams

### High Level Design (HLD)
```mermaid
graph TD
    Client[Next.js Client] -->|Uploads CSV| UI(Upload Modal)
    UI -->|Displays Preview| DataGrid[Preview Table]
    DataGrid -->|POST /api/upload-csv/| API[Django REST API]
    API -->|Sends chunked data| LangChain[LangChain AI Agent]
    LangChain -->|Prompt + JSON| LLM[OpenRouter / GPT-4o]
    LLM -->|Extracts CRM JSON| LangChain
    LangChain -->|Validates Schema| Parser[Pydantic Output Parser]
    Parser -->|Returns structured lists| API
    API -->|Displays Extracted Results| Client
    API -->|Saves if configured| Database[(Neon PostgreSQL DB)]
```

### Low Level Design (LLD) - AI Extraction Flow
```mermaid
sequenceDiagram
    participant User
    participant Frontend as Next.js UI
    participant Views as Django Views
    participant Extractor as AI Extractor
    participant LLM as OpenRouter API

    User->>Frontend: Selects CSV File
    Frontend->>Frontend: parse with PapaParse (preview)
    User->>Frontend: Clicks "Confirm & Extract"
    Frontend->>Views: POST multipart/form-data
    Views->>Views: Converts CSV to dict list
    Views->>Views: Chunks list into batches of 10
    Views->>Extractor: extract_crm_data(batch)
    
    loop For each batch
        Extractor->>LLM: Chain.invoke(batch)
        alt Success
            LLM-->>Extractor: Structured JSON response
        else Failure (e.g. 429, 402)
            Extractor-->>Extractor: Tenacity @retry (up to 3x)
            alt Retry Exhausted
                Extractor-->>Extractor: Append batch to 'skipped'
            end
        end
    end
    
    Extractor->>Views: Return parsed[], skipped[]
    Views-->>Frontend: JSON Response {total_imported, successfully_parsed}
    Frontend-->>User: Renders ResultsView
```
