import sys
import pandas as pd
from app.cleaner import generate_sample_data
from app.ai_analyst import ask_ai_analyst

sys.stdout.reconfigure(encoding='utf-8')

def test_questions():
    df = generate_sample_data()
    print("ORIGINAL DF DTYPES:\n", df.dtypes)
    print("SAMPLE TOTAL REVENUE:", df['Total Revenue ($)'].tolist())
    
    working_df = df.copy()
    from app.cleaner import clean_currency_numeric
    for c in working_df.columns:
        if working_df[c].dtype == 'object':
            cleaned_series = working_df[c].apply(clean_currency_numeric)
            if cleaned_series.notna().sum() > 0:
                working_df[c] = cleaned_series.fillna(0)
    print("WORKING DF DTYPES:\n", working_df.dtypes)
    print("CLEANED TOTAL REVENUE:", working_df['Total Revenue ($)'].tolist())
    
    questions = [
        "What is my top-performing item?",
        "What's the best product?",
        "What should I stop selling?",
        "What is the lowest selling product?",
        "Which product makes the least money?",
        "How can I improve my profit margins?",
        "Are weekend sales higher than weekdays?",
        "How many items are in my catalog?"
    ]
    
    for q in questions:
        print("="*60)
        print(f"QUESTION: {q}")
        print("-"*60)
        res = ask_ai_analyst(df, q)
        print("ANSWER EXPLANATION:\n", res["explanation"])
        if res.get("chart_config"):
            print("CHART GENERATED:", res["chart_config"]["title"])
        else:
            print("NO CHART (OR SANDBOX FAILED)")
            print("ERROR:", res.get("error"))
            print("CODE EXECUTED:\n", res.get("executed_code"))
        print("\n")

if __name__ == "__main__":
    test_questions()
