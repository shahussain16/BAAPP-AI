import pandas as pd
import io
from app.cleaner import analyze_dataset, clean_dataset, compute_dashboard_metrics, sanitize_df_for_json

def test_random_csvs():
    print("Testing random CSV variations...")

    # Case 1: Latin-1 encoding with $ symbols and messy headers
    csv_latin1 = """Product,Date,Price,Qty,Notes
Coffee,$4.50,10,Great
Tea,08/12/2026,$3.00,,Warm
Cake,2026-08-13,$15.00,2,Delicious
"""
    df1 = pd.read_csv(io.StringIO(csv_latin1))
    print("CSV 1 parsed:", df1.columns.tolist())
    analysis1 = analyze_dataset(df1)
    df_clean1, report1 = clean_dataset(df1)
    metrics1 = compute_dashboard_metrics(df_clean1)
    json_safe1 = sanitize_df_for_json(df_clean1)
    print("CSV 1 metrics OK! Total Rev:", metrics1['totals']['total_revenue'])

    # Case 2: Random non-financial CSV (e.g., student grades or inventory without price)
    csv_random = """ID,Student Name,Grade,Subject
1,Alice,95,Math
2,Bob,88,Science
3,Charlie,,Math
"""
    df2 = pd.read_csv(io.StringIO(csv_random))
    print("\nCSV 2 parsed:", df2.columns.tolist())
    analysis2 = analyze_dataset(df2)
    df_clean2, report2 = clean_dataset(df2)
    metrics2 = compute_dashboard_metrics(df_clean2)
    json_safe2 = sanitize_df_for_json(df_clean2)
    print("CSV 2 metrics OK! Rows:", len(json_safe2))

    # Case 3: CSV with duplicate column names
    csv_dup_cols = """Item,Amount,Amount,Date
Pen,10,20,2026-08-01
Pencil,5,10,2026-08-02
"""
    df3 = pd.read_csv(io.StringIO(csv_dup_cols))
    print("\nCSV 3 parsed:", df3.columns.tolist())
    analysis3 = analyze_dataset(df3)
    df_clean3, report3 = clean_dataset(df3)
    metrics3 = compute_dashboard_metrics(df_clean3)
    json_safe3 = sanitize_df_for_json(df_clean3)
    print("CSV 3 metrics OK! Rows:", len(json_safe3))

if __name__ == "__main__":
    test_random_csvs()
    print("\n[SUCCESS] All Random CSV edge case tests passed!")
