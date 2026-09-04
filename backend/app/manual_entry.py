import pandas as pd
from typing import List, Dict, Any

def process_manual_entries(entries: List[Dict[str, Any]]) -> pd.DataFrame:
    """
    Takes a list of manually entered dictionaries from the frontend form
    and converts them into a standardized DataFrame.
    """
    if not entries:
        return pd.DataFrame(columns=["Date", "Item Name", "Category", "Quantity Sold", "Unit Price ($)", "Total Revenue ($)", "Expense ($)"])
    
    df = pd.DataFrame(entries)
    
    # Ensure expected standard columns exist
    column_mapping = {
        "date": "Date",
        "item_name": "Item Name",
        "category": "Category",
        "quantity": "Quantity Sold",
        "unit_price": "Unit Price ($)",
        "revenue": "Total Revenue ($)",
        "expense": "Expense ($)"
    }
    
    df = df.rename(columns={k: v for k, v in column_mapping.items() if k in df.columns})
    
    # Calculate Total Revenue automatically if missing but Quantity & Unit Price are present
    if "Total Revenue ($)" in df.columns and ("Quantity Sold" in df.columns and "Unit Price ($)" in df.columns):
        for idx, row in df.iterrows():
            if pd.isna(row.get("Total Revenue ($)")) or row.get("Total Revenue ($)") == "":
                try:
                    qty = float(row.get("Quantity Sold", 0))
                    price = float(row.get("Unit Price ($)", 0))
                    df.at[idx, "Total Revenue ($)"] = qty * price
                except (ValueError, TypeError):
                    pass

    return df
