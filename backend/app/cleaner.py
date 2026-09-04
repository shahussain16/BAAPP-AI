import pandas as pd
import numpy as np
import re
from typing import Dict, Any, List, Tuple

def sanitize_df_for_json(df: pd.DataFrame) -> List[Dict[str, Any]]:
    """Converts a DataFrame to a list of dicts with NaNs cleanly converted to None for JSON compliance."""
    cleaned_df = df.copy()
    records = cleaned_df.to_dict(orient="records")
    sanitized = []
    for row in records:
        clean_row = {}
        for k, v in row.items():
            if pd.isna(v) or str(v) == 'nan' or str(v) == '<NaT>' or v is np.nan:
                clean_row[k] = None
            else:
                clean_row[k] = v
        sanitized.append(clean_row)
    return sanitized

def parse_mixed_dates(val):
    """Safely parse mixed date format into YYYY-MM-DD string or leave as string if unparseable."""
    if pd.isna(val) or val is None or str(val).strip() == "":
        return None
    val_str = str(val).strip()
    try:
        parsed = pd.to_datetime(val_str, errors='coerce', dayfirst=False)
        if pd.isna(parsed):
            parsed = pd.to_datetime(val_str, errors='coerce', dayfirst=True)
        if not pd.isna(parsed):
            return parsed.strftime('%Y-%m-%d')
    except Exception:
        pass
    return val_str

def clean_currency_numeric(val):
    """Convert currency strings ($12.50, €1,200.00, etc.) to float."""
    if pd.isna(val) or val is None:
        return None
    if isinstance(val, (int, float)):
        return float(val)
    val_str = str(val).strip()
    # Remove currency symbols, commas, and spaces
    cleaned_str = re.sub(r'[^\d.-]', '', val_str)
    try:
        return float(cleaned_str) if cleaned_str != "" else None
    except ValueError:
        return None

def analyze_dataset(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Analyzes a DataFrame and detects data quality issues with non-technical plain-English explanations.
    """
    total_rows = len(df)
    total_cols = len(df.columns)
    
    issues = []
    plain_english_summary = []
    
    # 1. Duplicates
    exact_duplicates = int(df.duplicated().sum())
    key_cols = [c for c in df.columns if any(k in c.lower() for k in ['date', 'item', 'product', 'name', 'time'])]
    soft_duplicates = 0
    if len(key_cols) >= 2:
        soft_duplicates = int(df.duplicated(subset=key_cols).sum()) - exact_duplicates
        if soft_duplicates < 0:
            soft_duplicates = 0

    if exact_duplicates > 0:
        issues.append({
            "type": "exact_duplicates",
            "title": "Duplicate Entries Found",
            "count": exact_duplicates,
            "severity": "medium",
            "description": f"We found {exact_duplicates} exact duplicate row(s) in your dataset."
        })
        plain_english_summary.append(f"We spotted {exact_duplicates} exact duplicate row(s) that appear more than once.")

    if soft_duplicates > 0:
        issues.append({
            "type": "soft_duplicates",
            "title": "Possible Matching Transactions",
            "count": soft_duplicates,
            "severity": "low",
            "description": f"Found {soft_duplicates} row(s) with identical dates and item names."
        })
        plain_english_summary.append(f"Found {soft_duplicates} row(s) with identical dates and product names.")

    # 2. Missing Values
    missing_by_col = df.isnull().sum()
    total_missing = int(missing_by_col.sum())
    missing_cols_detail = {}
    for col in df.columns:
        cnt = int(missing_by_col[col])
        if cnt > 0:
            missing_cols_detail[col] = cnt

    if total_missing > 0:
        col_list_str = ", ".join([f"'{c}' ({cnt} missing)" for c, cnt in missing_cols_detail.items()])
        issues.append({
            "type": "missing_values",
            "title": "Missing Details",
            "count": total_missing,
            "severity": "high" if total_missing > total_rows * 0.1 else "medium",
            "description": f"There are {total_missing} empty cell(s) across columns: {col_list_str}."
        })
        plain_english_summary.append(f"There are {total_missing} empty detail(s) missing across your records ({', '.join(missing_cols_detail.keys())}).")

    # 3. Formatting (Dates, Currency, Casing)
    date_cols = [c for c in df.columns if 'date' in c.lower() or 'day' in c.lower() or 'time' in c.lower()]
    unformatted_dates_count = 0
    for dcol in date_cols:
        for val in df[dcol].dropna():
            val_str = str(val).strip()
            # check if not already YYYY-MM-DD
            if not re.match(r'^\d{4}-\d{2}-\d{2}$', val_str):
                unformatted_dates_count += 1
                break

    if unformatted_dates_count > 0:
        issues.append({
            "type": "inconsistent_dates",
            "title": "Mixed Date Formats",
            "count": unformatted_dates_count,
            "severity": "medium",
            "description": "Dates are written in different formats (e.g. 08/01/2026 vs Aug 1, 2026)."
        })
        plain_english_summary.append("Your dates use mixed formats (like 08/01/2026 and 1-Aug-2026). We can standardize them into clean YYYY-MM-DD dates.")

    # Currency / Text formatted numbers
    numeric_as_text_count = 0
    for col in df.columns:
        if any(k in col.lower() for k in ['price', 'cost', 'revenue', 'sale', 'amount', 'expense', 'total', 'qty', 'quantity']):
            for val in df[col].dropna():
                if isinstance(val, str) and (re.search(r'[\$€£,]', val) or val != val.strip()):
                    numeric_as_text_count += 1
                    break

    if numeric_as_text_count > 0:
        issues.append({
            "type": "currency_formatting",
            "title": "Currency & Symbol Formatting",
            "count": numeric_as_text_count,
            "severity": "low",
            "description": "Amounts include currency symbols ($, €) or commas that prevent automated math."
        })
        plain_english_summary.append("Some dollar amounts include symbols or commas formatted as text instead of clean numbers.")

    # Text Casing / Whitespace
    casing_issues = 0
    text_cols = [c for c in df.columns if df[c].dtype == 'object' and c not in date_cols]
    for col in text_cols:
        unique_vals = df[col].dropna().astype(str).tolist()
        stripped = [v.strip().title() for v in unique_vals]
        if len(set(unique_vals)) > len(set(stripped)):
            casing_issues += (len(set(unique_vals)) - len(set(stripped)))

    if casing_issues > 0:
        issues.append({
            "type": "text_casing",
            "title": "Inconsistent Product Names / Text",
            "count": casing_issues,
            "severity": "low",
            "description": "Similar items have different capitalization or extra spaces (e.g., 'coffee', 'Coffee ', 'COFFEE')."
        })
        plain_english_summary.append(f"Found {casing_issues} item(s) with inconsistent capitalization or accidental spaces (e.g., 'coffee' vs 'Coffee').")

    # 4. Outliers
    outlier_count = 0
    num_cols = df.select_dtypes(include=[np.number]).columns
    outlier_details = []
    for col in num_cols:
        col_data = df[col].dropna()
        if len(col_data) > 4:
            q1 = col_data.quantile(0.25)
            q3 = col_data.quantile(0.75)
            iqr = q3 - q1
            if iqr > 0:
                lower_bound = q1 - 2.5 * iqr
                upper_bound = q3 + 2.5 * iqr
                outliers = col_data[(col_data < lower_bound) | (col_data > upper_bound)]
                if len(outliers) > 0:
                    outlier_count += len(outliers)
                    outlier_details.append(f"{col}: {len(outliers)} unusually high/low values")

    if outlier_count > 0:
        issues.append({
            "type": "outliers",
            "title": "Unusual High/Low Amounts",
            "count": outlier_count,
            "severity": "medium",
            "description": f"Spotted {outlier_count} transaction value(s) significantly higher than your typical average."
        })
        plain_english_summary.append(f"Spotted {outlier_count} unusually high transaction amount(s) that might be typos.")

    if not plain_english_summary:
        plain_english_summary.append("Great news! Your dataset looks clean and formatted ready for analysis!")

    return {
        "total_rows": total_rows,
        "total_cols": total_cols,
        "columns": list(df.columns),
        "issues": issues,
        "plain_english_summary": plain_english_summary,
        "missing_details": missing_cols_detail
    }

def clean_dataset(df: pd.DataFrame, options: Dict[str, bool] = None) -> Tuple[pd.DataFrame, Dict[str, Any]]:
    """
    Cleans the DataFrame based on vendor selected options or default smart fixes.
    """
    if options is None:
        options = {
            "remove_duplicates": True,
            "fix_dates": True,
            "fix_currency": True,
            "fix_text_casing": True,
            "fill_missing": True,
            "cap_outliers": False
        }

    cleaned_df = df.copy()
    changes_made = []

    # 1. Deduplication
    if options.get("remove_duplicates", True):
        before = len(cleaned_df)
        cleaned_df = cleaned_df.drop_duplicates().reset_index(drop=True)
        after = len(cleaned_df)
        removed = before - after
        if removed > 0:
            changes_made.append(f"Removed {removed} duplicate row(s).")

    # 2. Text Casing and Whitespace
    if options.get("fix_text_casing", True):
        date_cols = [c for c in cleaned_df.columns if 'date' in c.lower() or 'day' in c.lower() or 'time' in c.lower()]
        for col in cleaned_df.columns:
            if col not in date_cols and cleaned_df[col].dtype == 'object':
                cleaned_df[col] = cleaned_df[col].apply(
                    lambda x: str(x).strip().title() if pd.notna(x) and isinstance(x, str) else x
                )
        changes_made.append("Standardized capitalization and trimmed extra spaces across all text columns.")

    # 3. Currency / Numeric formatting
    if options.get("fix_currency", True):
        for col in cleaned_df.columns:
            if any(k in col.lower() for k in ['price', 'cost', 'revenue', 'sale', 'amount', 'expense', 'total', 'qty', 'quantity']):
                cleaned_df[col] = cleaned_df[col].apply(clean_currency_numeric)
        changes_made.append("Converted currency strings (e.g. $12.50) into clean numerical values.")

    # 4. Date Standardization
    if options.get("fix_dates", True):
        date_cols = [c for c in cleaned_df.columns if 'date' in c.lower() or 'day' in c.lower() or 'time' in c.lower()]
        for dcol in date_cols:
            cleaned_df[dcol] = cleaned_df[dcol].apply(parse_mixed_dates)
        changes_made.append("Standardized all dates to uniform YYYY-MM-DD format.")

    # 5. Missing Values Imputation
    if options.get("fill_missing", True):
        for col in cleaned_df.columns:
            if pd.api.types.is_numeric_dtype(cleaned_df[col]):
                # Fill missing numeric values with 0
                cleaned_df[col] = cleaned_df[col].fillna(0)
            else:
                # Fill missing text with "Unspecified" or empty date fallback
                if 'date' in col.lower():
                    cleaned_df[col] = cleaned_df[col].fillna("Not Specified")
                else:
                    cleaned_df[col] = cleaned_df[col].fillna("Unspecified")
        changes_made.append("Filled missing numbers with 0 and empty text fields with 'Unspecified'.")

    # Re-calculate clean statistics
    analysis = analyze_dataset(cleaned_df)

    return cleaned_df, {
        "changes_made": changes_made,
        "clean_summary": analysis["plain_english_summary"],
        "cleaned_rows": len(cleaned_df),
        "cleaned_cols": len(cleaned_df.columns)
    }

def compute_dashboard_metrics(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Computes business metrics and starter chart datasets from cleaned DataFrame.
    Dynamically detects dataset domain (Sales/Retail, Education, Library, General)
    and adapts chart titles, KPI labels, and units.
    """
    if df.empty:
        return {
            "domain": "sales",
            "domain_label": "Retail & Sales Data",
            "totals": {"total_revenue": 0, "total_expense": 0, "net_profit": 0, "profit_margin": 0, "total_items_sold": 0, "best_day": "N/A"},
            "revenue_over_time": [],
            "top_products": [],
            "slow_products": [],
            "category_expenses": []
        }

    cols = list(df.columns)
    cols_lower_str = " ".join([c.lower() for c in cols])

    # 1. Domain Detection Logic
    domain = "sales"
    domain_label = "Sales & Retail Data"
    
    if any(k in cols_lower_str for k in ['student', 'grade', 'score', 'course', 'subject', 'exam', 'gpa', 'class', 'teacher']):
        domain = "education"
        domain_label = "Education & Class Data"
        metric_1_label = "Total Student Records"
        metric_2_label = "Average Grade / Score"
        chart_1_title = "Academic Progress Over Time"
        chart_2_title = "Top-Performing Courses / Subjects"
        chart_3_title = "Students / Subjects Needing Support"
        chart_4_title = "Grade Distribution by Subject"
    elif any(k in cols_lower_str for k in ['book', 'author', 'borrower', 'isbn', 'genre', 'due date', 'checkout', 'circulation', 'library']):
        domain = "library"
        domain_label = "Library & Catalog Data"
        metric_1_label = "Total Circulation Records"
        metric_2_label = "Unique Titles"
        chart_1_title = "Circulation Activity Over Time"
        chart_2_title = "Most Popular Books / Authors"
        chart_3_title = "Least Borrowed Books"
        chart_4_title = "Circulation by Genre"
    else:
        domain = "sales"
        domain_label = "Sales & Operations Data"
        metric_1_label = "Total Revenue"
        metric_2_label = "Net Profit"
        chart_1_title = "Revenue & Profit Over Time"
        chart_2_title = "Top-Performing Items by Revenue"
        chart_3_title = "Slow-Moving / Low-Volume Items"
        chart_4_title = "Sales & Expense Share by Category"

    # Dynamic column identification with expanded keywords
    date_col = next((c for c in cols if any(k in c.lower() for k in ['date', 'day', 'time', 'month', 'year', 'semester'])), None)
    item_col = next((c for c in cols if any(k in c.lower() for k in ['item', 'product', 'name', 'desc', 'title', 'sku', 'goods', 'student', 'book', 'course', 'subject'])), None)
    cat_col = next((c for c in cols if any(k in c.lower() for k in ['category', 'type', 'group', 'dept', 'department', 'class', 'genre', 'subject'])), None)
    
    rev_col = next((c for c in cols if any(k in c.lower() for k in ['revenue', 'total', 'sale', 'amount', 'earning', 'income', 'subtotal', 'value', 'grade', 'score', 'gpa'])), None)
    price_col = next((c for c in cols if any(k in c.lower() for k in ['price', 'rate', 'unit price', 'unit_price', 'cost/unit', 'score'])), None)
    qty_col = next((c for c in cols if any(k in c.lower() for k in ['qty', 'quantity', 'sold', 'units', 'count', 'volume', 'borrowed', 'checkout'])), None)
    exp_col = next((c for c in cols if any(k in c.lower() for k in ['expense', 'cost', 'spending', 'fee'])), None)

    temp_df = df.copy()

    # Ensure numeric types for calculation
    for c in [rev_col, price_col, qty_col, exp_col]:
        if c and c in temp_df.columns and temp_df[c].dtype == 'object':
            temp_df[c] = temp_df[c].apply(clean_currency_numeric).fillna(0)

    # Calculate Revenue / Metric column if missing but price & quantity exist
    computed_rev_col = rev_col
    if not computed_rev_col and price_col and qty_col:
        temp_df['__computed_revenue__'] = temp_df[price_col] * temp_df[qty_col]
        computed_rev_col = '__computed_revenue__'
    elif not computed_rev_col and price_col:
        computed_rev_col = price_col

    total_revenue = float(temp_df[computed_rev_col].sum()) if computed_rev_col else 0.0
    total_expense = float(temp_df[exp_col].sum()) if exp_col else 0.0
    net_profit = total_revenue - total_expense
    profit_margin = round((net_profit / total_revenue * 100), 1) if total_revenue > 0 else 0.0
    total_items_sold = int(temp_df[qty_col].sum()) if qty_col else len(temp_df)

    # 1. Timeline Chart Data
    revenue_over_time = []
    best_day = "N/A"
    if date_col and computed_rev_col:
        time_grouped = temp_df.groupby(date_col).agg(
            revenue=(computed_rev_col, 'sum'),
            expense=(exp_col, 'sum') if exp_col else (computed_rev_col, lambda x: 0)
        ).reset_index().sort_values(by=date_col)
        
        for _, row in time_grouped.iterrows():
            d_str = str(row[date_col])
            rev_val = round(float(row['revenue']), 2)
            exp_val = round(float(row['expense']), 2)
            revenue_over_time.append({
                "date": d_str,
                "revenue": rev_val,
                "expense": exp_val,
                "profit": round(rev_val - exp_val, 2)
            })
        
        if revenue_over_time:
            best_entry = max(revenue_over_time, key=lambda x: x["revenue"])
            prefix = "$" if domain == "sales" else ""
            best_day = f"{best_entry['date']} ({prefix}{best_entry['revenue']:,.2f})"

    # 2. Top-performing entities
    top_products = []
    effective_item_col = item_col or (cols[0] if cols else None)
    if effective_item_col:
        agg_dict = {}
        if computed_rev_col: agg_dict['revenue'] = (computed_rev_col, 'sum')
        if qty_col: agg_dict['quantity'] = (qty_col, 'sum')
        
        if agg_dict:
            prod_grouped = temp_df.groupby(effective_item_col).agg(**agg_dict).reset_index()
            sort_key = 'revenue' if computed_rev_col else 'quantity'
            top_df = prod_grouped.sort_values(by=sort_key, ascending=False).head(6)
            for _, row in top_df.iterrows():
                top_products.append({
                    "item": str(row[effective_item_col]),
                    "revenue": round(float(row.get('revenue', 0)), 2),
                    "quantity": int(row.get('quantity', 0))
                })

    # 3. Bottom-performing / Low-volume entities
    slow_products = []
    if effective_item_col:
        target_qty_col = qty_col or computed_rev_col
        if target_qty_col:
            prod_qty = temp_df.groupby(effective_item_col)[target_qty_col].sum().reset_index()
            slow_df = prod_qty.sort_values(by=target_qty_col, ascending=True).head(6)
            for _, row in slow_df.iterrows():
                slow_products.append({
                    "item": str(row[effective_item_col]),
                    "quantity": int(row[target_qty_col]),
                    "revenue": round(float(temp_df[temp_df[effective_item_col] == row[effective_item_col]][computed_rev_col].sum()), 2) if computed_rev_col else 0
                })

    # 4. Category breakdown
    category_expenses = []
    if cat_col:
        cat_agg = {}
        if computed_rev_col: cat_agg['revenue'] = (computed_rev_col, 'sum')
        if exp_col: cat_agg['expense'] = (exp_col, 'sum')
        
        if cat_agg:
            cat_grouped = temp_df.groupby(cat_col).agg(**cat_agg).reset_index()
            for _, row in cat_grouped.iterrows():
                category_expenses.append({
                    "category": str(row[cat_col]),
                    "revenue": round(float(row.get('revenue', 0)), 2),
                    "expense": round(float(row.get('expense', 0)), 2)
                })

def compute_sales_forecast(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Computes 7-day sales forecast and moving average trend projections from cleaned DataFrame.
    """
    if df.empty:
        return {"forecast": [], "trend": "flat", "projected_7day_total": 0}

    cols = list(df.columns)
    date_col = next((c for c in cols if any(k in str(c).lower() for k in ['date', 'day', 'time', 'month', 'year'])), None)
    rev_col = next((c for c in cols if any(k in str(c).lower() for k in ['revenue', 'total', 'sale', 'amount', 'earning', 'income', 'value'])), None)
    qty_col = next((c for c in cols if any(k in str(c).lower() for k in ['qty', 'quantity', 'sold', 'units'])), None)
    price_col = next((c for c in cols if any(k in str(c).lower() for k in ['price', 'rate', 'unit price'])), None)

    val_col = rev_col
    temp_df = df.copy()
    if not val_col and price_col and qty_col:
        temp_df['__rev__'] = temp_df[price_col] * temp_df[qty_col]
        val_col = '__rev__'
    elif not val_col:
        val_col = price_col or qty_col or cols[-1]

    if date_col and val_col:
        temp_df[val_col] = temp_df[val_col].apply(clean_currency_numeric).fillna(0)
        daily = temp_df.groupby(date_col)[val_col].sum().reset_index().sort_values(by=date_col)
        
        if len(daily) > 1:
            mean_daily = daily[val_col].mean()
            recent_trend = daily[val_col].tail(3).mean()
            growth_rate = (recent_trend - mean_daily) / mean_daily if mean_daily > 0 else 0
            
            forecast_list = []
            last_date = pd.to_datetime(daily[date_col].iloc[-1], errors='coerce')
            if pd.isna(last_date):
                last_date = pd.Timestamp.now()
                
            projected_7day = 0
            for i in range(1, 8):
                next_dt = (last_date + pd.Timedelta(days=i)).strftime('%Y-%m-%d')
                proj_val = round(max(0, mean_daily * (1 + growth_rate * 0.2)), 2)
                projected_7day += proj_val
                forecast_list.append({"date": next_dt, "projected_sales": proj_val})
                
            trend_type = "growing" if growth_rate > 0.05 else "declining" if growth_rate < -0.05 else "stable"
            return {
                "forecast": forecast_list,
                "trend": trend_type,
                "projected_7day_total": round(projected_7day, 2),
                "avg_daily_sales": round(mean_daily, 2)
            }

    return {"forecast": [], "trend": "stable", "projected_7day_total": 0, "avg_daily_sales": 0}

def generate_sample_data() -> pd.DataFrame:
    """Generates realistic sample sales dataset for a bakery/cafe with intentional messy data for testing."""
    sample_records = [
        {"Date": "2026-08-01", "Item Name": "Blueberry Muffin", "Category": "Bakery", "Quantity Sold": "12", "Unit Price ($)": "$3.50", "Total Revenue ($)": "$42.00", "Expense ($)": "$12.00"},
        {"Date": "08/01/2026", "Item Name": "blueberry muffin", "Category": "bakery", "Quantity Sold": "12", "Unit Price ($)": "$3.50", "Total Revenue ($)": "$42.00", "Expense ($)": "$12.00"}, # duplicate/casing/date format
        {"Date": "2026-08-01", "Item Name": "Iced Latte", "Category": "Beverage", "Quantity Sold": "25", "Unit Price ($)": "$4.75", "Total Revenue ($)": "$118.75", "Expense ($)": "$30.00"},
        {"Date": "2-Aug-2026", "Item Name": "Croissant", "Category": "Bakery", "Quantity Sold": "18", "Unit Price ($)": "$3.00", "Total Revenue ($)": "54.00", "Expense ($)": "15.00"},
        {"Date": "2026-08-02", "Item Name": "CROISSANT ", "Category": "Bakery", "Quantity Sold": "18", "Unit Price ($)": "$3.00", "Total Revenue ($)": "$54.00", "Expense ($)": "$15.00"}, # casing & space
        {"Date": "2026-08-02", "Item Name": "Cappuccino", "Category": "Beverage", "Quantity Sold": "30", "Unit Price ($)": "$4.50", "Total Revenue ($)": "$135.00", "Expense ($)": "$35.00"},
        {"Date": "2026-08-03", "Item Name": "Avocado Toast", "Category": "Food", "Quantity Sold": None, "Unit Price ($)": "$9.50", "Total Revenue ($)": "$85.50", "Expense ($)": "$25.00"}, # missing quantity
        {"Date": "2026-08-03", "Item Name": "Espresso Shot", "Category": "Beverage", "Quantity Sold": "40", "Unit Price ($)": "$2.50", "Total Revenue ($)": "$100.00", "Expense ($)": "$10.00"},
        {"Date": "2026-08-04", "Item Name": "Cinnamon Roll", "Category": "Bakery", "Quantity Sold": "15", "Unit Price ($)": "$4.00", "Total Revenue ($)": "$60.00", "Expense ($)": "$18.00"},
        {"Date": "Aug 4, 2026", "Item Name": "Catering Party Platter", "Category": "Catering", "Quantity Sold": "1", "Unit Price ($)": "$450.00", "Total Revenue ($)": "$450.00", "Expense ($)": "$150.00"}, # outlier transaction
        {"Date": "2026-08-05", "Item Name": "Matcha Latte", "Category": "Beverage", "Quantity Sold": "20", "Unit Price ($)": "$5.25", "Total Revenue ($)": "$105.00", "Expense ($)": "$28.00"},
        {"Date": "2026-08-05", "Item Name": "Chocolate Chip Cookie", "Category": "Bakery", "Quantity Sold": "35", "Unit Price ($)": "$2.25", "Total Revenue ($)": "$78.75", "Expense ($)": "$20.00"},
        {"Date": None, "Item Name": "Cold Brew", "Category": "Beverage", "Quantity Sold": "22", "Unit Price ($)": "$4.25", "Total Revenue ($)": "$93.50", "Expense ($)": "$22.00"}, # missing date
        {"Date": "2026-08-06", "Item Name": "Ham & Cheese Panini", "Category": "Food", "Quantity Sold": "14", "Unit Price ($)": "$8.75", "Total Revenue ($)": "$122.50", "Expense ($)": "$40.00"},
        {"Date": "2026-08-07", "Item Name": "Fruit Smoothie", "Category": "Beverage", "Quantity Sold": "19", "Unit Price ($)": "$5.50", "Total Revenue ($)": "$104.50", "Expense ($)": "$32.00"}
    ]
    return pd.DataFrame(sample_records)
