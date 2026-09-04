from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class CleanOptions(BaseModel):
    remove_duplicates: bool = True
    fix_dates: bool = True
    fix_currency: bool = True
    fix_text_casing: bool = True
    fill_missing: bool = True
    cap_outliers: bool = False

class ManualRow(BaseModel):
    date: Optional[str] = ""
    item_name: Optional[str] = ""
    category: Optional[str] = "Bakery"
    quantity: Optional[Any] = 0
    unit_price: Optional[Any] = 0
    expense: Optional[Any] = 0

class ManualEntryRequest(BaseModel):
    entries: List[ManualRow]
    options: Optional[CleanOptions] = CleanOptions()

class CleanRequest(BaseModel):
    raw_data: List[Dict[str, Any]]
    options: Optional[CleanOptions] = CleanOptions()

class ChatRequest(BaseModel):
    question: str
    cleaned_data: List[Dict[str, Any]]

