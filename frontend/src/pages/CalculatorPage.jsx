import { useState } from 'react';
import { carbonAPI } from '../services/api';
import { Calculator, Zap, Utensils, Car, Lightbulb } from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function CalculatorPage() {
  const [form, setForm] = useState({ electricity_kwh: 10, food_type: 'veg', travel_mode: 'car', travel_distance_km: 20 });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCalc = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await carbonAPI.calculate(form);
      setResult(res.data);
    } finally { setLoading(false); }
  };

  const barData = result ? {
    labels: ['Electricity', 'Food', 'Travel'],
    datasets: [{ label: 'CO2 (kg)', data: [result.breakdown.electricity_co2_kg, result.breakdown.food_co2_kg, result.breakdown.travel_co2_kg], backgroundColor: ['#f59e0b', '#10b981', '#06b6d4'], borderRadius: 8, barThickness: 40 }],
  } : null;

  const barOpts = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { ticks: { color: 'var(--text-muted)' }, grid: { display: false } }, y: { ticks: { color: 'var(--text-muted)' }, grid: { color: 'rgba(100,116,139,0.1)' } } } };

  return (
    <div className="animate-fade-in">
      <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: 8 }}>
        <Calculator size={24} style={{ display: 'inline', marginRight: 8, verticalAlign: 'text-bottom' }} />
        Carbon Footprint Calculator
      </h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>Calculate your daily CO2 emissions and get AI-powered suggestions.</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Input Form */}
        <div className="glass-card" style={{ padding: 24 }}>
          <form onSubmit={handleCalc} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}><Zap size={14} /> Electricity (kWh/day)</label>
              <input type="number" className="input" min="0" step="0.1" value={form.electricity_kwh} onChange={e => setForm({ ...form, electricity_kwh: +e.target.value })} />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}><Utensils size={14} /> Food Type</label>
              <select className="input" value={form.food_type} onChange={e => setForm({ ...form, food_type: e.target.value })}>
                <option value="vegan">Vegan</option>
                <option value="veg">Vegetarian</option>
                <option value="non-veg">Non-Vegetarian</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}><Car size={14} /> Travel Mode</label>
              <select className="input" value={form.travel_mode} onChange={e => setForm({ ...form, travel_mode: e.target.value })}>
                <option value="walk">Walk</option>
                <option value="bike">Bike</option>
                <option value="bus">Bus</option>
                <option value="train">Train</option>
                <option value="car">Car</option>
                <option value="flight">Flight</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}><Car size={14} /> Distance (km)</label>
              <input type="number" className="input" min="0" step="0.1" value={form.travel_distance_km} onChange={e => setForm({ ...form, travel_distance_km: +e.target.value })} />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: 12 }} disabled={loading}>{loading ? 'Calculating...' : 'Calculate Footprint'}</button>
          </form>
        </div>

        {/* Results */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {result ? (
            <>
              <div className="glass-card" style={{ padding: 24, textAlign: 'center' }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Daily Carbon Footprint</p>
                <p style={{ fontSize: '3rem', fontWeight: 800, marginTop: 4 }}><span className="gradient-text">{result.breakdown.total_co2_kg}</span></p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>kg CO2 equivalent</p>
                <div style={{ marginTop: 12 }}><span className={`badge ${result.comparison.rating === 'excellent' || result.comparison.rating === 'good' ? 'badge-green' : result.comparison.rating === 'average' ? 'badge-amber' : 'badge-red'}`}>{result.comparison.rating.toUpperCase()} - {result.comparison.percentage_of_average}% of average</span></div>
              </div>

              <div className="glass-card" style={{ padding: 24 }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 12 }}>Emission Breakdown</h3>
                <div style={{ height: 180 }}><Bar data={barData} options={barOpts} /></div>
              </div>

              <div className="glass-card" style={{ padding: 24 }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}><Lightbulb size={16} /> AI Suggestions</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {result.suggestions.map((s, i) => (
                    <div key={i} style={{ padding: '12px 14px', borderRadius: 'var(--radius)', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span className="badge badge-blue" style={{ textTransform: 'capitalize' }}>{s.category}</span>
                        {s.potential_saving_kg > 0 && <span className="badge badge-green">-{s.potential_saving_kg} kg</span>}
                      </div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{s.suggestion}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="glass-card" style={{ padding: 40, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <Calculator size={48} color="var(--text-muted)" />
              <p style={{ color: 'var(--text-muted)', marginTop: 16 }}>Fill in your daily activities and click Calculate to see your carbon footprint.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
