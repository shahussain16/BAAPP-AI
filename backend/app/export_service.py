import pandas as pd
import io
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils.dataframe import dataframe_to_rows

def generate_csv_bytes(df: pd.DataFrame) -> bytes:
    """Generates standard UTF-8 CSV bytes."""
    output = io.BytesIO()
    df.to_csv(output, index=False, encoding='utf-8')
    output.seek(0)
    return output.getvalue()

def generate_excel_bytes(df: pd.DataFrame) -> bytes:
    """
    Generates a beautifully styled Excel (.xlsx) workbook using openpyxl.
    Includes headers, zebra striping, currency formatting, and auto column widths.
    """
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Cleaned Business Data"

    # Write DataFrame rows
    for r in dataframe_to_rows(df, index=False, header=True):
        ws.append(r)

    # Styles
    header_fill = PatternFill(start_color="1E3A8A", end_color="1E3A8A", fill_type="solid")
    header_font = Font(name="Calibri", size=11, bold=True, color="FFFFFF")
    data_font = Font(name="Calibri", size=10)
    zebra_fill = PatternFill(start_color="F8FAFC", end_color="F8FAFC", fill_type="solid")
    thin_border = Border(
        left=Side(style='thin', color='E2E8F0'),
        right=Side(style='thin', color='E2E8F0'),
        top=Side(style='thin', color='E2E8F0'),
        bottom=Side(style='thin', color='E2E8F0')
    )

    # Format Headers (Row 1)
    for cell in ws[1]:
        cell.fill = header_fill
        cell.font = header_font
        cell.alignment = Alignment(horizontal="center", vertical="center")

    # Format Data Rows
    for row_idx, row in enumerate(ws.iter_rows(min_row=2), start=2):
        is_even = row_idx % 2 == 0
        for cell in row:
            cell.font = data_font
            cell.border = thin_border
            if is_even:
                cell.fill = zebra_fill
            # Align numbers right, text left
            if isinstance(cell.value, (int, float)):
                cell.alignment = Alignment(horizontal="right")
                cell.number_format = '$#,##0.00' if cell.value and cell.value > 1 else '#,##0.00'
            else:
                cell.alignment = Alignment(horizontal="left")

    # Auto-adjust Column Widths
    for col in ws.columns:
        max_len = max(len(str(cell.value or '')) for cell in col)
        col_letter = openpyxl.utils.get_column_letter(col[0].column)
        ws.column_dimensions[col_letter].width = max(max_len + 4, 12)

    output = io.BytesIO()
    wb.save(output)
    output.seek(0)
    return output.getvalue()

def generate_powerbi_bytes(df: pd.DataFrame) -> bytes:
    """
    Generates a Power BI / Tableau optimized CSV with metadata comments.
    """
    output = io.StringIO()
    output.write("# BAAPP-AI Power BI Optimized Export\n")
    output.write(f"# Export Date: {pd.Timestamp.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
    output.write(f"# Total Records: {len(df)}\n")
    df.to_csv(output, index=False)
    
    bytes_output = io.BytesIO(output.getvalue().encode('utf-8'))
    bytes_output.seek(0)
    return bytes_output.getvalue()
