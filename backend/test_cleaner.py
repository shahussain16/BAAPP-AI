import pandas as pd
from app.cleaner import generate_sample_data, analyze_dataset, clean_dataset
from app.manual_entry import process_manual_entries

def test_auto_cleaner():
    print("Testing generate_sample_data...")
    df_raw = generate_sample_data()
    print(f"Raw DataFrame generated with {len(df_raw)} rows.")
    
    print("\nTesting analyze_dataset...")
    analysis = analyze_dataset(df_raw)
    print("Plain-English Summaries generated:")
    for summary in analysis["plain_english_summary"]:
        print(f" - {summary}")
        
    print("\nTesting clean_dataset...")
    df_cleaned, report = clean_dataset(df_raw)
    print(f"Cleaned DataFrame has {len(df_cleaned)} rows.")
    print("Changes Made:")
    for change in report["changes_made"]:
        print(f" - {change}")

def test_manual_entry():
    print("\nTesting process_manual_entries...")
    entries = [
        {"date": "08/10/2026", "item_name": "iced coffee", "quantity": "10", "unit_price": "$4.00"},
        {"date": "2026-08-10", "item_name": "Iced Coffee ", "quantity": "10", "unit_price": "$4.00"}
    ]
    df_manual = process_manual_entries(entries)
    analysis = analyze_dataset(df_manual)
    df_cleaned, report = clean_dataset(df_manual)
    print(f"Processed {len(df_cleaned)} manual rows cleanly.")

if __name__ == "__main__":
    test_auto_cleaner()
    test_manual_entry()
    print("\n[SUCCESS] All Backend Cleaner Tests PASSED!")
