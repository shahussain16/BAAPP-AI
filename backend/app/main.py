from fastapi import FastAPI, UploadFile, File, HTTPException, Form, Response
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import io
import json
from typing import Optional, List, Dict, Any

from app.cleaner import analyze_dataset, clean_dataset, generate_sample_data, sanitize_df_for_json, compute_dashboard_metrics
from app.manual_entry import process_manual_entries
from app.models import CleanOptions, ManualEntryRequest, CleanRequest, ChatRequest
from app.ai_analyst import ask_ai_analyst
from app.export_service import generate_csv_bytes, generate_excel_bytes, generate_powerbi_bytes

app = FastAPI(
    title="BAAPP-AI Backend API",
    description="AI-Powered Business Data Analyst API for Small Food/Retail Vendors",
    version="1.0.0"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health_check():
    return {"status": "online", "app": "BAAPP-AI Backend"}

@app.get("/api/sample-data")
def get_sample_data():
    """Provides instant realistic sample dataset for vendor testing."""
    df_raw = generate_sample_data()
    analysis = analyze_dataset(df_raw)
    df_clean, clean_report = clean_dataset(df_raw)
    metrics = compute_dashboard_metrics(df_clean)
    
    return {
        "filename": "sample_cafe_sales.csv",
        "raw_data": sanitize_df_for_json(df_raw),
        "analysis": analysis,
        "cleaned_data": sanitize_df_for_json(df_clean),
        "clean_report": clean_report,
        "dashboard_metrics": metrics
    }

@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    """Handles CSV and Excel file uploads with robust multi-encoding fallbacks."""
    filename = file.filename.lower()
    content = await file.read()
    
    df = None
    if filename.endswith(".csv") or not filename.endswith((".xlsx", ".xls")):
        for encoding in ['utf-8', 'utf-8-sig', 'latin-1', 'cp1252', 'iso-8859-1']:
            try:
                df = pd.read_csv(io.BytesIO(content), encoding=encoding)
                break
            except Exception:
                continue
        if df is None:
            raise HTTPException(status_code=400, detail="Could not read CSV file. Please check file encoding.")
    elif filename.endswith((".xlsx", ".xls")):
        try:
            df = pd.read_excel(io.BytesIO(content))
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to read Excel file: {str(e)}")

    if df is None or df.empty:
        raise HTTPException(status_code=400, detail="Uploaded file is empty or could not be parsed.")

    analysis = analyze_dataset(df)
    df_clean, clean_report = clean_dataset(df)
    metrics = compute_dashboard_metrics(df_clean)

    return {
        "filename": file.filename,
        "raw_data": sanitize_df_for_json(df),
        "analysis": analysis,
        "cleaned_data": sanitize_df_for_json(df_clean),
        "clean_report": clean_report,
        "dashboard_metrics": metrics
    }

@app.post("/api/manual-entry")
def handle_manual_entry(payload: ManualEntryRequest):
    """Processes manually entered data rows from vendor form."""
    raw_dicts = [entry.model_dump() for entry in payload.entries]
    df_raw = process_manual_entries(raw_dicts)
    
    if df_raw.empty:
        raise HTTPException(status_code=400, detail="No manual entries provided.")
        
    analysis = analyze_dataset(df_raw)
    df_clean, clean_report = clean_dataset(df_raw, payload.options.model_dump() if payload.options else None)
    metrics = compute_dashboard_metrics(df_clean)

    return {
        "filename": "manual_entry_data.csv",
        "raw_data": sanitize_df_for_json(df_raw),
        "analysis": analysis,
        "cleaned_data": sanitize_df_for_json(df_clean),
        "clean_report": clean_report,
        "dashboard_metrics": metrics
    }

@app.post("/api/clean")
def run_clean_dataset(payload: CleanRequest):
    """Runs data cleaning with customized vendor options."""
    if not payload.raw_data:
        raise HTTPException(status_code=400, detail="No raw dataset provided.")
        
    df_raw = pd.DataFrame(payload.raw_data)
    options_dict = payload.options.model_dump() if payload.options else None
    
    df_clean, clean_report = clean_dataset(df_raw, options_dict)
    metrics = compute_dashboard_metrics(df_clean)

    return {
        "cleaned_data": sanitize_df_for_json(df_clean),
        "clean_report": clean_report,
        "dashboard_metrics": metrics
    }

@app.post("/api/chat")
def handle_chat_question(payload: ChatRequest):
    """Executes sandboxed pandas code to answer vendor question with zero hallucination."""
    if not payload.cleaned_data:
        raise HTTPException(status_code=400, detail="No cleaned dataset provided to analyze.")
        
    df = pd.DataFrame(payload.cleaned_data)
    ai_response = ask_ai_analyst(df, payload.question)
    return ai_response

# Export Endpoints
@app.post("/api/export/csv")
def export_csv(payload: Dict[str, Any]):
    cleaned_data = payload.get("cleaned_data", [])
    if not cleaned_data:
        raise HTTPException(status_code=400, detail="No data to export.")
    df = pd.DataFrame(cleaned_data)
    csv_bytes = generate_csv_bytes(df)
    return Response(
        content=csv_bytes,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=cleaned_business_data.csv"}
    )

@app.post("/api/export/excel")
def export_excel(payload: Dict[str, Any]):
    cleaned_data = payload.get("cleaned_data", [])
    if not cleaned_data:
        raise HTTPException(status_code=400, detail="No data to export.")
    df = pd.DataFrame(cleaned_data)
    excel_bytes = generate_excel_bytes(df)
    return Response(
        content=excel_bytes,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=cleaned_business_data.xlsx"}
    )

@app.post("/api/export/powerbi")
def export_powerbi(payload: Dict[str, Any]):
    cleaned_data = payload.get("cleaned_data", [])
    if not cleaned_data:
        raise HTTPException(status_code=400, detail="No data to export.")
    df = pd.DataFrame(cleaned_data)
    pb_bytes = generate_powerbi_bytes(df)
    return Response(
        content=pb_bytes,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=powerbi_ready_dataset.csv"}
    )
