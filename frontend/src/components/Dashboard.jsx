import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { DollarSign, TrendingUp, ShoppingBag, AlertTriangle, Layers, Award, BookOpen, GraduationCap } from 'lucide-react';

const COLORS = ['#2563eb', '#059669', '#d97706', '#7c3aed', '#e11d48', '#0891b2'];

export default function Dashboard({ metrics, cleanedData }) {
  let computed = metrics;
  if (!computed && cleanedData && cleanedData.length > 0) {
    computed = computeClientSideMetrics(cleanedData);
  }

  const domain = computed?.domain || 'sales';
  const domainLabel = computed?.domain_label || 'Business Analytics';
  const labels = computed?.labels || {
    metric_1: 'Total Revenue',
    metric_2: 'Net Profit',
    chart_1: 'Revenue & Profit Over Time',
    chart_2: 'Top-Selling Products by Revenue',
    chart_3: 'Slow-Moving Products',
    chart_4: 'Sales & Expense Share by Category'
  };

  const totals = computed?.totals || { total_revenue: 0, total_expense: 0, net_profit: 0, profit_margin: 0, total_items_sold: 0, best_day: 'N/A' };
  const revenueOverTime = computed?.revenue_over_time || [];
  const topProducts = computed?.top_products || [];
  const slowProducts = computed?.slow_products || [];
  const categoryExpenses = computed?.category_expenses || [];

  const isCurrencyDomain = domain === 'sales';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Domain Badge Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          {domain === 'education' && <GraduationCap color="#7c3aed" size={24} />}
          {domain === 'library' && <BookOpen color="#059669" size={24} />}
          {domain === 'sales' && <Award color="#2563eb" size={24} />}
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>{domainLabel}</h2>
        </div>
        <span className="badge-tag" style={{ background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1' }}>
          Detected Domain: {domain.toUpperCase()}
        </span>
      </div>

      {/* 1. Top KPI Summary Tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
        <div className="card-box" style={{ padding: '1.25rem', margin: 0, borderLeft: '4px solid #2563eb' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>{labels.metric_1}</span>
            <div style={{ background: '#dbeafe', color: '#2563eb', padding: '0.4rem', borderRadius: '8px' }}>
              {isCurrencyDomain ? <DollarSign size={18} /> : <Award size={18} />}
            </div>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>
            {isCurrencyDomain ? '$' : ''}{(totals.total_revenue || 0).toLocaleString(undefined, { minimumFractionDigits: isCurrencyDomain ? 2 : 0, maximumFractionDigits: 2 })}
          </div>
          <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Aggregate sum</span>
        </div>

        <div className="card-box" style={{ padding: '1.25rem', margin: 0, borderLeft: '4px solid #059669' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>{labels.metric_2}</span>
            <div style={{ background: '#d1fae5', color: '#059669', padding: '0.4rem', borderRadius: '8px' }}>
              <TrendingUp size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: totals.net_profit >= 0 ? '#059669' : '#e11d48' }}>
            {isCurrencyDomain ? '$' : ''}{(totals.net_profit || 0).toLocaleString(undefined, { minimumFractionDigits: isCurrencyDomain ? 2 : 0, maximumFractionDigits: 2 })}
          </div>
          {isCurrencyDomain && (
            <span className="badge-tag" style={{ background: '#ecfdf5', color: '#047857' }}>
              {totals.profit_margin || 0}% Margin
            </span>
          )}
        </div>

        <div className="card-box" style={{ padding: '1.25rem', margin: 0, borderLeft: '4px solid #e11d48' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>{isCurrencyDomain ? 'Total Expenses' : 'Secondary Metric'}</span>
            <div style={{ background: '#ffe4e6', color: '#e11d48', padding: '0.4rem', borderRadius: '8px' }}>
              <DollarSign size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>
            {isCurrencyDomain ? '$' : ''}{(totals.total_expense || 0).toLocaleString(undefined, { minimumFractionDigits: isCurrencyDomain ? 2 : 0, maximumFractionDigits: 2 })}
          </div>
          <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Operational cost / secondary sum</span>
        </div>

        <div className="card-box" style={{ padding: '1.25rem', margin: 0, borderLeft: '4px solid #7c3aed' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Volume / Count</span>
            <div style={{ background: '#ede9fe', color: '#7c3aed', padding: '0.4rem', borderRadius: '8px' }}>
              <ShoppingBag size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>
            {(totals.total_items_sold || 0).toLocaleString()} {domain === 'education' ? 'students' : domain === 'library' ? 'books' : 'units'}
          </div>
          <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Total count</span>
        </div>
      </div>

      {/* 2. Starter Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '1.5rem' }}>
        
        {/* Chart 1: Timeline */}
        <div className="card-box" style={{ margin: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={20} color="#2563eb" />
              {labels.chart_1}
            </h3>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Timeline Trend</span>
          </div>

          <div style={{ width: '100%', height: 280 }}>
            {revenueOverTime.length > 0 ? (
              <ResponsiveContainer>
                <AreaChart data={revenueOverTime} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(val) => isCurrencyDomain ? `$${val}` : `${val}`} />
                  <Tooltip formatter={(value) => [isCurrencyDomain ? `$${Number(value).toFixed(2)}` : Number(value), 'Value']} />
                  <Legend />
                  <Area type="monotone" dataKey="revenue" name={isCurrencyDomain ? "Total Revenue ($)" : "Value / Activity"} stroke="#2563eb" fillOpacity={1} fill="url(#colorRev)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8' }}>
                No date timeline data available
              </div>
            )}
          </div>
        </div>

        {/* Chart 2: Top-Performing Items */}
        <div className="card-box" style={{ margin: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Award size={20} color="#059669" />
              {labels.chart_2}
            </h3>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Top Performers</span>
          </div>

          <div style={{ width: '100%', height: 280 }}>
            {topProducts.length > 0 ? (
              <ResponsiveContainer>
                <BarChart data={topProducts} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="item" tick={{ fontSize: 11 }} interval={0} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(val) => isCurrencyDomain ? `$${val}` : `${val}`} />
                  <Tooltip formatter={(value) => [isCurrencyDomain ? `$${Number(value).toFixed(2)}` : Number(value), 'Metric']} />
                  <Bar dataKey="revenue" name="Metric" fill="#059669" radius={[6, 6, 0, 0]}>
                    {topProducts.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8' }}>
                No top performer data available
              </div>
            )}
          </div>
        </div>

        {/* Chart 3: Low-Volume / Bottom Items */}
        <div className="card-box" style={{ margin: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertTriangle size={20} color="#d97706" />
              {labels.chart_3}
            </h3>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Attention Items</span>
          </div>

          <div style={{ width: '100%', height: 280 }}>
            {slowProducts.length > 0 ? (
              <ResponsiveContainer>
                <BarChart data={slowProducts} layout="vertical" margin={{ top: 10, right: 20, left: 40, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis dataKey="item" type="category" tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(value) => [`${value}`, 'Volume / Count']} />
                  <Bar dataKey="quantity" name="Volume / Count" fill="#d97706" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8' }}>
                No volume count data available
              </div>
            )}
          </div>
        </div>

        {/* Chart 4: Category Breakdown */}
        <div className="card-box" style={{ margin: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Layers size={20} color="#7c3aed" />
              {labels.chart_4}
            </h3>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Category Share</span>
          </div>

          <div style={{ width: '100%', height: 280 }}>
            {categoryExpenses.length > 0 ? (
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={categoryExpenses}
                    dataKey="revenue"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={5}
                    label={({ category, percent }) => `${category} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {categoryExpenses.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [isCurrencyDomain ? `$${Number(value).toFixed(2)}` : Number(value), 'Category Share']} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8' }}>
                No category breakdown data available
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

// Client-side fallback metrics calculation if backend metrics are absent
function computeClientSideMetrics(data) {
  if (!data || data.length === 0) return null;
  const cols = Object.keys(data[0]);
  const dateCol = cols.find(c => /date|day|time|month|year|semester/i.test(c));
  const itemCol = cols.find(c => /item|product|name|desc|title|sku|student|book|course|subject/i.test(c));
  const catCol = cols.find(c => /category|type|group|dept|department|class|genre|subject/i.test(c));
  const revCol = cols.find(c => /revenue|total|sale|amount|earning|income|subtotal|value|grade|score|gpa/i.test(c));
  const qtyCol = cols.find(c => /qty|quantity|sold|units|count|volume|borrowed|checkout/i.test(c));
  const expCol = cols.find(c => /expense|cost|spending|fee/i.test(c));

  let totalRev = 0, totalExp = 0, totalQty = 0;
  const timeMap = {}, itemMap = {}, catMap = {};

  data.forEach(row => {
    const rev = parseFloat(String(row[revCol] || 0).replace(/[^\d.-]/g, '')) || 0;
    const exp = parseFloat(String(row[expCol] || 0).replace(/[^\d.-]/g, '')) || 0;
    const qty = parseFloat(String(row[qtyCol] || 0).replace(/[^\d.-]/g, '')) || 0;

    totalRev += rev;
    totalExp += exp;
    totalQty += qty;

    if (dateCol && row[dateCol]) {
      const d = String(row[dateCol]);
      if (!timeMap[d]) timeMap[d] = { date: d, revenue: 0, expense: 0, profit: 0 };
      timeMap[d].revenue += rev;
      timeMap[d].expense += exp;
      timeMap[d].profit += (rev - exp);
    }

    if (itemCol && row[itemCol]) {
      const item = String(row[itemCol]);
      if (!itemMap[item]) itemMap[item] = { item, revenue: 0, quantity: 0 };
      itemMap[item].revenue += rev;
      itemMap[item].quantity += qty;
    }

    if (catCol && row[catCol]) {
      const cat = String(row[catCol]);
      if (!catMap[cat]) catMap[cat] = { category: cat, revenue: 0, expense: 0 };
      catMap[cat].revenue += rev;
      catMap[cat].expense += exp;
    }
  });

  const netProfit = totalRev - totalExp;
  const profitMargin = totalRev > 0 ? (netProfit / totalRev) * 100 : 0;

  return {
    domain: "sales",
    domain_label: "Sales & Operations Data",
    labels: {
      metric_1: 'Total Revenue',
      metric_2: 'Net Profit',
      chart_1: 'Revenue & Profit Over Time',
      chart_2: 'Top-Selling Products by Revenue',
      chart_3: 'Slow-Moving Products',
      chart_4: 'Sales & Expense Share by Category'
    },
    totals: {
      total_revenue: totalRev,
      total_expense: totalExp,
      net_profit: netProfit,
      profit_margin: parseFloat(profitMargin.toFixed(1)),
      total_items_sold: totalQty || data.length,
      best_day: 'N/A'
    },
    revenue_over_time: Object.values(timeMap),
    top_products: Object.values(itemMap).sort((a, b) => b.revenue - a.revenue).slice(0, 6),
    slow_products: Object.values(itemMap).sort((a, b) => a.quantity - b.quantity).slice(0, 6),
    category_expenses: Object.values(catMap)
  };
}
