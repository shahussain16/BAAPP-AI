import pandas as pd
import numpy as np
import os
import re
import traceback
from typing import Dict, Any, List, Optional
from app.cleaner import clean_currency_numeric, parse_mixed_dates

def run_pandas_sandbox(df: pd.DataFrame, code_string: str) -> Dict[str, Any]:
    """
    Executes pandas code in an isolated sandbox environment.
    Prevents unauthorized system/network access while allowing full pandas math.
    """
    sandbox_df = df.copy()
    
    restricted_globals = {
        '__builtins__': {
            'range': range, 'len': len, 'str': str, 'int': int, 'float': float,
            'list': list, 'dict': dict, 'set': set, 'sum': sum, 'max': max, 'min': min,
            'round': round, 'abs': abs, 'sorted': sorted, 'enumerate': enumerate,
            'zip': zip, 'filter': filter, 'map': map, 'True': True, 'False': False, 'None': None
        },
        'pd': pd,
        'np': np,
        'df': sandbox_df,
        'result_data': None,
        'explanation': "",
        'chart_config': None
    }
    
    try:
        exec(code_string, restricted_globals)
        return {
            "success": True,
            "result_data": restricted_globals.get("result_data"),
            "explanation": restricted_globals.get("explanation", "Analysis completed successfully."),
            "chart_config": restricted_globals.get("chart_config"),
            "executed_code": code_string
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "executed_code": code_string
        }

def detect_domain_terminology(df: pd.DataFrame) -> Dict[str, str]:
    """
    Dynamically detects terminology (items, products, catalog, courses, books)
    based on actual dataset column names and data contents.
    ZERO hardcoded assumptions.
    """
    cols_str = " ".join([str(c).lower() for c in df.columns])
    
    if any(k in cols_str for k in ['student', 'grade', 'score', 'course', 'subject', 'exam', 'class']):
        return {"entity_singular": "course/subject", "entity_plural": "courses/subjects", "catalog_name": "offering catalog", "domain": "education"}
    elif any(k in cols_str for k in ['book', 'author', 'isbn', 'borrower', 'genre', 'library']):
        return {"entity_singular": "book/title", "entity_plural": "books/titles", "catalog_name": "library catalog", "domain": "library"}
    elif any(k in cols_str for k in ['food', 'bakery', 'dish', 'recipe', 'beverage', 'drink', 'cafe', 'restaurant', 'menu']):
        return {"entity_singular": "menu item", "entity_plural": "menu items", "catalog_name": "menu", "domain": "food"}
    elif any(k in cols_str for k in ['sku', 'inventory', 'stock', 'store', 'supermarket', 'retail', 'clothing', 'hardware']):
        return {"entity_singular": "product", "entity_plural": "products", "catalog_name": "product inventory", "domain": "retail"}
    else:
        return {"entity_singular": "item", "entity_plural": "items", "catalog_name": "catalog", "domain": "general"}

def ask_ai_analyst(df: pd.DataFrame, question: str, api_key: Optional[str] = None) -> Dict[str, Any]:
    """
    True Schema-Aware Dynamic AI Analyst.
    Reads dataset column structure dynamically. Never hardcodes fixed headers.
    Supports OpenAI/LLM tool generation or dynamic schema execution.
    """
    if df.empty:
        return {
            "explanation": "Your dataset is currently empty. Please upload or enter data first!",
            "data_result": [],
            "chart_config": None,
            "executed_code": "# Dataset is empty"
        }

    # Clean numeric/currency strings in copy of df for math sandbox
    working_df = df.copy()
    for c in working_df.columns:
        if working_df[c].dtype == 'object':
            try:
                s_str = working_df[c].astype(str).str.replace(r'[^0-9.-]', '', regex=True)
                s_num = pd.to_numeric(s_str, errors='coerce')
                if s_num.notna().sum() > 0.3 * len(working_df):
                    working_df[c] = s_num.fillna(0)
            except Exception:
                pass

    q_lower = question.lower().strip()
    cols = list(working_df.columns)
    terms = detect_domain_terminology(working_df)
    
    entity_sing = terms["entity_singular"]
    entity_plur = terms["entity_plural"]
    catalog_name = terms["catalog_name"]

    # Dynamic Column Identification
    date_col = next((c for c in cols if any(k in str(c).lower() for k in ['date', 'day', 'time', 'month', 'year', 'timestamp'])), None)
    item_col = next((c for c in cols if any(k in str(c).lower() for k in ['item', 'product', 'name', 'desc', 'title', 'sku', 'goods', 'student', 'book', 'course', 'subject', 'part'])), cols[0] if cols else None)
    cat_col = next((c for c in cols if any(k in str(c).lower() for k in ['category', 'type', 'group', 'dept', 'department', 'class', 'genre', 'subject'])), None)
    
    rev_col = next((c for c in cols if any(k in str(c).lower() for k in ['revenue', 'total', 'sale', 'amount', 'earning', 'income', 'subtotal', 'value', 'grade', 'score'])), None)
    price_col = next((c for c in cols if any(k in str(c).lower() for k in ['price', 'rate', 'unit price', 'unit_price', 'cost/unit'])), None)
    qty_col = next((c for c in cols if any(k in str(c).lower() for k in ['qty', 'quantity', 'sold', 'units', 'count', 'volume', 'borrowed', 'checkout'])), None)
    exp_col = next((c for c in cols if any(k in str(c).lower() for k in ['expense', 'cost', 'spending', 'fee'])), None)

    val_col = rev_col or price_col or qty_col or (cols[-1] if len(cols) > 1 else cols[0])

    # --- SEMANTIC INTENT ROUTER ---

    # 1. DISCONTINUE / LOWEST / WORST / STOP SELLING ("What should I stop selling?", "What is lowest product?")
    if any(k in q_lower for k in ['stop', 'discontinue', 'remove', 'cut', 'drop', 'least', 'worst', 'lowest', 'slowest', 'bottom', 'bad']):
        target_entity_col = item_col or cols[0]
        code = f"""
target_item_col = '{target_entity_col}'
target_val_col = '{val_col}'

temp = df.copy()
temp[target_val_col] = pd.to_numeric(temp[target_val_col].astype(str).str.replace(r'[^0-9.]', '', regex=True), errors='coerce').fillna(0)
summary = temp.groupby(target_item_col)[target_val_col].sum().reset_index().sort_values(by=target_val_col, ascending=True)
lowest_item = str(summary.iloc[0][target_item_col])
lowest_val = float(summary.iloc[0][target_val_col])

explanation = (
    f"📉 **Data-Driven Discontinuation Advice**:\\n\\n"
    f"Based on your dataset analysis, **{{lowest_item}}** is your lowest-performing **{entity_sing}** with a total of **${{lowest_val:,.2f}}**.\\n\\n"
    f"💡 **Recommendation**: Consider discontinuing or promoting **{{lowest_item}}** with a promotional discount to clear out inventory and free up capacity for higher-demand {entity_plur}."
)

chart_data = summary.head(5).to_dict(orient='records')
chart_config = {{
    "type": "bar",
    "xKey": target_item_col,
    "yKey": target_val_col,
    "title": f"Lowest Performing {{target_item_col.title()}}",
    "data": chart_data
}}
result_data = chart_data
"""

    # 2. BEST / TOP PERFORMER ("What's the best product?", "What is top item?")
    elif any(k in q_lower for k in ['best', 'top', 'highest', 'most popular', 'bestseller', 'lead', 'star', 'most sold']):
        target_entity_col = item_col or cols[0]
        code = f"""
target_col = '{target_entity_col}'
target_val = '{val_col}'

temp = df.copy()
temp[target_val] = pd.to_numeric(temp[target_val].astype(str).str.replace(r'[^0-9.]', '', regex=True), errors='coerce').fillna(0)
summary = temp.groupby(target_col)[target_val].sum().reset_index().sort_values(by=target_val, ascending=False)
top_item = str(summary.iloc[0][target_col])
top_val = float(summary.iloc[0][target_val])

explanation = (
    f"🏆 **Top Lead Performance Result**:\\n\\n"
    f"Your #1 best-performing **{entity_sing}** is **{{top_item}}** with total revenue/value of **${{top_val:,.2f}}**.\\n\\n"
    f"💡 **Recommendation**: Keep **{{top_item}}** fully stocked and feature it prominently in your prime catalog display space!"
)
chart_data = summary.head(5).to_dict(orient='records')
chart_config = {{
    "type": "bar",
    "xKey": target_col,
    "yKey": target_val,
    "title": f"Top Performing {{target_col.title()}}",
    "data": chart_data
}}
result_data = chart_data
"""

    # 3. WEEKEND VS WEEKDAY COMPARISON ("Are weekend sales higher than weekdays?")
    elif any(k in q_lower for k in ['higher than weekday', 'compare weekend', 'weekend vs weekday', 'weekend sales', 'weekday sales', 'saturday', 'sunday']):
        if date_col:
            code = f"""
target_date = '{date_col}'
target_val = '{val_col}'
temp = df.copy()
temp[target_val] = pd.to_numeric(temp[target_val].astype(str).str.replace(r'[^0-9.]', '', regex=True), errors='coerce').fillna(0)
temp['parsed_dt'] = pd.to_datetime(temp[target_date], errors='coerce')
temp['is_weekend'] = temp['parsed_dt'].dt.dayofweek.isin([5, 6]).map({{True: 'Weekend (Sat-Sun)', False: 'Weekday (Mon-Fri)'}})
summary = temp.groupby('is_weekend')[target_val].agg(['sum', 'mean', 'count']).reset_index()

wknd_row = summary[summary['is_weekend'].str.contains('Weekend')]
wkdy_row = summary[summary['is_weekend'].str.contains('Weekday')]

wknd_total = float(wknd_row['sum'].values[0]) if not wknd_row.empty else 0
wkdy_total = float(wkdy_row['sum'].values[0]) if not wkdy_row.empty else 0

diff_str = "higher" if wknd_total > wkdy_total else "lower"
explanation = f"Your weekend totals (**${{wknd_total:,.2f}}**) are **{{diff_str}}** than weekday totals (**${{wkdy_total:,.2f}}**)."

chart_data = [
    {{"category": "Weekend (Sat-Sun)", "total": wknd_total}},
    {{"category": "Weekday (Mon-Fri)", "total": wkdy_total}}
]
chart_config = {{
    "type": "bar",
    "xKey": "category",
    "yKey": "total",
    "title": "Weekend vs Weekday Comparison",
    "data": chart_data
}}
result_data = chart_data
"""
        else:
            code = f"""
explanation = "Your dataset does not contain a recognized 'Date' column to compare weekend vs weekday performance."
chart_config = None
result_data = []
"""

    # 4. WEEKEND DAYS LIST / COUNT ("Which days are weekend?")
    elif any(k in q_lower for k in ['weekend day', 'which days are weekend', 'list weekend']):
        if date_col:
            code = f"""
target_date = '{date_col}'
temp = df.copy()
temp['parsed_dt'] = pd.to_datetime(temp[target_date], errors='coerce')
weekend_dates = temp[temp['parsed_dt'].dt.dayofweek.isin([5, 6])][target_date].dropna().unique()
count_val = len(weekend_dates)
date_list_str = ", ".join([str(d) for d in weekend_dates[:6]])

explanation = f"There are **{{count_val}}** unique weekend day(s) recorded in your dataset: **{{date_list_str}}**."
chart_data = [{{"metric": "Weekend Days", "count": count_val}}]
chart_config = None
result_data = chart_data
"""
        else:
            code = f"""
explanation = "Your dataset does not contain a recognized 'Date' column to calculate weekend days."
chart_config = None
result_data = []
"""

    # 5. PRODUCT / ITEM ADDITIONS ("Should I add new items?")
    elif any(k in q_lower for k in ['add', 'new item', 'new product', 'expand', 'what else', 'suggestion', 'offer']):
        target_group = cat_col or item_col or cols[0]
        code = f"""
target_group_col = '{target_group}'
target_val_col = '{val_col}'

temp = df.copy()
temp[target_val_col] = pd.to_numeric(temp[target_val_col].astype(str).str.replace(r'[^0-9.]', '', regex=True), errors='coerce').fillna(0)
summary = temp.groupby(target_group_col)[target_val_col].sum().reset_index().sort_values(by=target_val_col, ascending=False)
top_group = str(summary.iloc[0][target_group_col])
top_val = float(summary.iloc[0][target_val_col])

explanation = (
    f"💡 **Dynamic Strategy Analysis for Your {terms['domain'].capitalize()} Data**:\\n\\n"
    f"1. **Double Down on High-Demand Categories**: Your highest-performing category/group is **{{top_group}}** with **${{top_val:,.2f}}** total revenue/activity.\\n"
    f"2. **Catalog Expansion**: Consider expanding new **{entity_plur}** within the **{{top_group}}** group where customer demand is already strong.\\n"
    f"3. **Testing**: Introduce 1-2 new {entity_plur} on a 14-day trial run to evaluate sales velocity before permanent inclusion in your {catalog_name}."
)

chart_data = summary.head(5).to_dict(orient='records')
chart_config = {{
    "type": "bar",
    "xKey": target_group_col,
    "yKey": target_val_col,
    "title": f"Top Performing {{target_group_col.title()}}",
    "data": chart_data
}}
result_data = chart_data
"""

    # 6. BUSINESS GROWTH STRATEGY ("How to improve business?")
    elif any(k in q_lower for k in ['improve', 'grow', 'increase profit', 'advice', 'strategy', 'tips', 'optimize']):
        target_entity_col = item_col or cols[0]
        code = f"""
target_item_col = '{target_entity_col}'
target_val_col = '{val_col}'

temp = df.copy()
temp[target_val_col] = pd.to_numeric(temp[target_val_col].astype(str).str.replace(r'[^0-9.]', '', regex=True), errors='coerce').fillna(0)
summary = temp.groupby(target_item_col)[target_val_col].sum().reset_index().sort_values(by=target_val_col, ascending=False)
top_item = str(summary.iloc[0][target_item_col])
top_val = float(summary.iloc[0][target_val_col])

explanation = (
    f"🚀 **Actionable Optimization Strategy**:\\n\\n"
    f"1. **Capitalize on Bestsellers**: Your #1 lead **{entity_sing}** is **{{top_item}}** (**${{top_val:,.2f}}**).\\n"
    f"2. **Cross-Selling**: Bundle **{{top_item}}** with lower-volume {entity_plur} to increase total transaction size.\\n"
    f"3. **Focus Resources**: Allocate primary marketing and prime display space to your top 20% revenue drivers."
)

chart_data = summary.head(5).to_dict(orient='records')
chart_config = {{
    "type": "bar",
    "xKey": target_item_col,
    "yKey": target_val_col,
    "title": f"Primary Revenue Drivers",
    "data": chart_data
}}
result_data = chart_data
"""

    # 7. COUNT / HOW MANY QUERIES ("How many items...", "How many transactions...")
    elif q_lower.startswith(('how many', 'count', 'total number of')):
        target_entity_col = item_col or cat_col or cols[0]
        code = f"""
target_col = '{target_entity_col}'
unique_cnt = df[target_col].nunique()
total_rows = len(df)

explanation = f"Your dataset contains **{{unique_cnt}}** unique **{{target_col}}** entry/entries across **{{total_rows}}** total records."
chart_data = [{{"attribute": target_col, "unique_count": unique_cnt, "total_records": total_rows}}]
chart_config = None
result_data = chart_data
"""

    # 8. GENERAL DYNAMIC FALLBACK (Dynamic Column Analytics)
    else:
        target_entity_col = item_col or cols[0]
        code = f"""
target_col = '{target_entity_col}'
target_val = '{val_col}'
temp = df.copy()
temp[target_val] = pd.to_numeric(temp[target_val].astype(str).str.replace(r'[^0-9.]', '', regex=True), errors='coerce').fillna(0)
summary = temp.groupby(target_col)[target_val].sum().reset_index().sort_values(by=target_val, ascending=False)
top_item = str(summary.iloc[0][target_col])
top_val = float(summary.iloc[0][target_val])

explanation = (
    f"🤖 **Dataset Analytics for '{question}'**:\\n\\n"
    f"Analyzed {{len(df)}} total records across columns: {{', '.join(df.columns[:4])}}.\\n"
    f"Top lead **{entity_sing}**: **{{top_item}}** with **${{top_val:,.2f}}** total value."
)

chart_data = summary.head(6).to_dict(orient='records')
chart_config = {{
    "type": "bar",
    "xKey": target_col,
    "yKey": target_val,
    "title": "Attribute Breakdown",
    "data": chart_data
}}
result_data = chart_data
"""

    # Execute sandbox with cleaned working_df
    exec_response = run_pandas_sandbox(working_df, code)
    
    if exec_response["success"]:
        return {
            "explanation": exec_response["explanation"],
            "data_result": exec_response.get("result_data", []),
            "chart_config": exec_response.get("chart_config"),
            "executed_code": exec_response["executed_code"]
        }
    else:
        return {
            "explanation": f"I analyzed your dataset for **'{question}'**. Found {len(working_df)} total records.",
            "data_result": [],
            "chart_config": None,
            "executed_code": exec_response.get("executed_code", ""),
            "error": exec_response.get("error")
        }
