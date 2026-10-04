import { useState, useEffect } from 'react';
import { marketplaceAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ShoppingCart, Plus, DollarSign } from 'lucide-react';

export default function MarketplacePage() {
  const { user } = useAuth();
  const [credits, setCredits] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', tons_co2: 1, price_usd: 10 });
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadCredits(); }, []);
  const loadCredits = async () => { const r = await marketplaceAPI.browse(); setCredits(r.data); };

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    await marketplaceAPI.listCredit(form);
    setShowCreate(false);
    setForm({ title: '', description: '', tons_co2: 1, price_usd: 10 });
    await loadCredits();
    setLoading(false);
  };

  const handlePurchase = async (id) => {
    if (!confirm('Confirm purchase of this carbon credit?')) return;
    await marketplaceAPI.purchase(id);
    await loadCredits();
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>
            <ShoppingCart size={24} style={{ display: 'inline', marginRight: 8, verticalAlign: 'text-bottom' }} />
            Carbon Offset Marketplace
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>Buy and sell carbon credits to offset emissions.</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} className="btn btn-primary"><Plus size={16} /> List Credit</button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 16 }}>List Carbon Credit for Sale</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div><label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Title</label><input className="input" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
            <div><label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Description</label><input className="input" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
            <div><label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Tons CO2</label><input type="number" className="input" min="0.1" step="0.1" value={form.tons_co2} onChange={e => setForm({ ...form, tons_co2: +e.target.value })} /></div>
            <div><label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Price (USD)</label><input type="number" className="input" min="1" value={form.price_usd} onChange={e => setForm({ ...form, price_usd: +e.target.value })} /></div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Creating...' : 'List for Sale'}</button>
            <button type="button" onClick={() => setShowCreate(false)} className="btn btn-secondary">Cancel</button>
          </div>
        </form>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
        {credits.map((c, i) => (
          <div key={c.id} className="glass-card animate-fade-in" style={{ padding: 20, animationDelay: `${i * 0.05}s` }}>
            <h3 style={{ fontWeight: 700, marginBottom: 6 }}>{c.title}</h3>
            {c.description && <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 12 }}>{c.description}</p>}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <div><span className="badge badge-blue">{c.tons_co2} tons CO2</span></div>
              <div style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--color-accent)', display: 'flex', alignItems: 'center', gap: 2 }}><DollarSign size={16} />{c.price_usd}</div>
            </div>
            {c.seller_id !== user?.id ? (
              <button onClick={() => handlePurchase(c.id)} className="btn btn-primary" style={{ width: '100%' }}>Purchase & Offset</button>
            ) : (
              <span className="badge badge-amber">Your Listing</span>
            )}
          </div>
        ))}
        {credits.length === 0 && <div className="glass-card" style={{ padding: 40, textAlign: 'center', gridColumn: '1 / -1' }}><p style={{ color: 'var(--text-muted)' }}>No credits available. List the first one!</p></div>}
      </div>
    </div>
  );
}
