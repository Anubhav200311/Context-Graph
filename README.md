# SAP O2C Graph Explorer

A graph-based data modeling and natural language query system for SAP Order-to-Cash (O2C) data. Explore interconnected business entities visually and query the dataset using natural language.

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen?style=flat-square)](https://frontend-tau-eight-uy8sllmueu.vercel.app/)
![Backend](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat-square)
![Database](https://img.shields.io/badge/Database-SQLite-003B57?style=flat-square)
![Graph](https://img.shields.io/badge/Graph-NetworkX-4B8BBE?style=flat-square)
![Frontend](https://img.shields.io/badge/Frontend-React-61DAFB?style=flat-square)

**[Live Demo](https://frontend-tau-eight-uy8sllmueu.vercel.app/)**

![App Screenshot](Image_preview.png)

## Features

- **Interactive Graph Visualization** — Force-directed graph of ~700 nodes and ~1200 edges across 8 SAP entity types
- **Natural Language Querying** — Ask questions in plain English, get data-backed answers via an NL→SQL→NL pipeline
- **Node Exploration** — Click any node to inspect metadata, filter by entity type, expand neighborhoods
- **Guardrails** — Two-layer filtering (regex + LLM) ensures only relevant queries hit the database

## Architecture

```
Frontend (React + react-force-graph)
        │
        │ REST API
        ▼
Backend (FastAPI)
  ├── Graph Engine (NetworkX) ── in-memory graph traversal
  ├── Chat Pipeline (Gemini/Ollama) ── NL → SQL → NL
  ├── Guardrails ── domain relevance filtering
  └── SQLite ── 19 normalized tables from SAP O2C data
```

**How the chat works:** User question → LLM generates SQL → SQL executes against SQLite → LLM summarizes results in natural language. The LLM never fabricates data — every answer is backed by actual query results.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, react-force-graph-2d, Vite |
| Backend | FastAPI, Python |
| Database | SQLite |
| Graph | NetworkX |
| LLM | Google Gemini (cloud) / Ollama (local) |

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- [Ollama](https://ollama.com) or a [Gemini API key](https://aistudio.google.com/apikey) (free)

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # then add your GEMINI_API_KEY or configure Ollama
python main.py          # runs on http://localhost:8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev             # runs on http://localhost:5173
```

## Project Structure

```
backend/
  main.py             API endpoints
  database.py         SQLite schema and data ingestion
  graph.py            Graph construction and traversal
  llm.py              LLM integration (Gemini/Ollama)
  guardrails.py       Query relevance filtering
frontend/
  src/App.jsx         Main layout and state
  src/components/     GraphView, ChatPanel, NodeDetail
```
