# JFK-RAG: Retrieval-Augmented Generation on Declassified JFK Archives

## Overview

JFK-RAG is a web application that lets users query declassified JFK-era documents through a Retrieval-Augmented Generation (RAG) pipeline.
The application is built on a serverless architecture, enabling fast, scalable inference backed by a custom archival dataset.

The project uses a fully client-facing React interface deployed on Vercel, with a backend powered by Vercel serverless functions, LangChain, Pinecone, and custom ingestion scripts.

## Dataset Background

This project is powered by a large corpus of historical material collected from the National Archives:

* Over **2,500 PDF documents** downloaded manually
* Approximately **65,000 pages** of scanned archival material
* OCR processed using **Google Cloud Document AI**
* Cleaned into thousands of `.txt` files
* Aggregated into a CSV of:

  ```
  file_name, text
  ```
* Chunked, embedded, and indexed into **Pinecone** for retrieval

These documents form the basis for the semantic search powering the RAG workflow.

## Tech Stack

### Frontend

* **React** (Vite)
* **Vercel** deployment
* Minimal, clean UI for querying archival data
* Communicates with the backend through API routes

### Backend

* **Vercel Serverless Functions** (located under `/api`)
* **LangChain** for RAG orchestration
* **Pinecone** for vector search
* **Node.js** environment inside the function
* Stateless, cold-start–friendly design

### Data Processing

* **Python** scripts for OCR text extraction
* CSV generation for ingestion
* Chunking and embedding pipeline

---

## Features

* Ask natural-language questions about JFK-era documents
* Retrieves the most relevant passages from the archive
* Produces grounded responses using context from Pinecone
* Serverless backend for low maintenance and high scalability
* Clean frontend with a simple chat-based interface

---

## Project Structure

The project structure reflects a serverless full-stack deployment on Vercel:

```
JFK-RAG-APP/
│   .vercel/
│
├── api/
│   └── chat.js          # Serverless function handling RAG queries
│
├── public/
│
├── src/
│   ├── assets/
│   ├── App.css
│   ├── App.jsx          # Main client UI
│   ├── index.css
│   └── main.jsx
│
├── .env                 # Pinecone + API keys (not committed)
├── index.html
├── package.json
├── vite.config.js
└── vercel.json
```

### Serverless Backend (`/api/chat.js`)

This file contains:

* Request parsing
* Retrieval from Pinecone
* LangChain prompt construction
* Response streaming back to the UI

This replaces the need for a separate backend server.

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set environment variables

Create a `.env` file:

```
OPENAI_API_KEY=your_key
PINECONE_API_KEY=your_key
PINECONE_INDEX=your_index_name
```

### 3. Run locally

```bash
npm run dev
```

### 4. Deploy to Vercel

```bash
vercel
```

The serverless function will deploy automatically based on the `/api` directory.

---

## How the Data Was Prepared

Here is a rewritten and accurate version of **How the Data Was Prepared**, reflecting exactly what you described earlier:

---

## How the Data Was Prepared

The dataset for this project originates from a large-scale archival collection process. Over 2,500 PDF documents were downloaded from the National Archives, totaling roughly 65,000 scanned pages. Because these files were image-based and varied in quality, each document required OCR to extract usable text.

Google Cloud Document AI was used to process every page. Document AI’s OCR pipeline converted the PDFs into machine-readable text while preserving structure and achieving high accuracy across thousands of historical scans. The OCR output was saved as individual `.txt` files.

A Python script was then used to iterate through all of these text files and compile them into a single CSV with two columns:

```
file_name, text
```

This CSV served as the starting point for ingestion. The text was cleaned, chunked into semantically meaningful segments, embedded using a openai-embedding-3-small model, and finally upserted into Pinecone to enable fast similarity search inside the RAG pipeline.
