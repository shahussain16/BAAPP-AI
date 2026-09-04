import React, { useState } from 'react';
import { PlusCircle, Trash2, CheckCircle2, ArrowRight } from 'lucide-react';

export default function ManualEntry({ onSubmitManual, isLoading }) {
  const [rows, setRows] = useState([
    { date: '2026-08-10', item_name: 'Fresh Espresso', category: 'Beverage', quantity: '15', unit_price: '3.50', expense: '8.00' },
    { date: '2026-08-10', item_name: 'Chocolate Muffin', category: 'Bakery', quantity: '10', unit_price: '4.00', expense: '12.00' },
    { date: '2026-08-11', item_name: 'fresh espresso', category: 'beverage', quantity: '15', unit_price: '$3.50', expense: '8.00' }, // intentional messy entry
  ]);

  const handleRowChange = (index, field, value) => {
    const updated = [...rows];
    updated[index][field] = value;
    setRows(updated);
  };

  const addRow = () => {
    setRows([
      ...rows,
      { date: new Date().toISOString().split('T')[0], item_name: '', category: 'Bakery', quantity: '', unit_price: '', expense: '' }
    ]);
  };

  const removeRow = (index) => {
    if (rows.length === 1) return;
    setRows(rows.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validRows = rows.filter(r => r.item_name || r.quantity || r.unit_price);
    if (validRows.length === 0) {
      alert('Please fill out at least one item row.');
      return;
    }
    onSubmitManual(validRows);
  };

  return (
    <div className="card-box">
      <div style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Quick Manual Entry Form</h3>
        <p style={{ fontSize: '0.88rem', color: '#64748b' }}>
          No spreadsheet? Type your daily sales or inventory items below, and our auto-cleaning engine will clean & format them for you.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {rows.map((row, idx) => (
          <div key={idx} className="form-grid" style={{ alignItems: 'end', paddingBottom: '0.5rem', borderBottom: '1px solid #f1f5f9' }}>
            <div className="form-group">
              <label>Date</label>
              <input
                type="text"
                className="form-control"
                placeholder="YYYY-MM-DD or 08/10/26"
                value={row.date}
                onChange={(e) => handleRowChange(idx, 'date', e.target.value)}
              />
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label>Item / Product Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Avocado Toast"
                value={row.item_name}
                onChange={(e) => handleRowChange(idx, 'item_name', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Category</label>
              <select
                className="form-control"
                value={row.category}
                onChange={(e) => handleRowChange(idx, 'category', e.target.value)}
              >
                <option value="Bakery">Bakery</option>
                <option value="Beverage">Beverage</option>
                <option value="Food">Food</option>
                <option value="Grocery">Grocery</option>
                <option value="Retail">Retail</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label>Qty Sold</label>
              <input
                type="text"
                className="form-control"
                placeholder="10"
                value={row.quantity}
                onChange={(e) => handleRowChange(idx, 'quantity', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Unit Price ($)</label>
              <input
                type="text"
                className="form-control"
                placeholder="$4.50"
                value={row.unit_price}
                onChange={(e) => handleRowChange(idx, 'unit_price', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Expense ($)</label>
              <input
                type="text"
                className="form-control"
                placeholder="$1.50"
                value={row.expense}
                onChange={(e) => handleRowChange(idx, 'expense', e.target.value)}
              />
            </div>

            <div className="form-group" style={{ width: '40px' }}>
              <button
                type="button"
                onClick={() => removeRow(idx)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0.5rem' }}
                title="Remove Row"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
          <button
            type="button"
            className="btn-sample"
            onClick={addRow}
          >
            <PlusCircle size={16} />
            Add Another Row
          </button>

          <button type="submit" className="btn-primary" disabled={isLoading}>
            <span>Run Auto-Cleaning Engine</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </form>
    </div>
  );
}
