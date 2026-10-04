import { useState, useEffect } from 'react';
import { activityAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Footprints, Plus } from 'lucide-react';

const TYPES = [
  { value: 'walking', label: 'Walking' },
  { value: 'cycling', label: 'Cycling' },
  { value: 'recycling', label: 'Recycling' },
  { value: 'reduced_electricity', label: 'Reduced Electricity' },
  { value: 'public_transport', label: 'Public Transport' },
  { value: 'composting', label: 'Composting' },
  { value: 'tree_planting', label: 'Tree Planting' },
  { value: 'vegan_meal', label: 'Vegan Meal' },
  { value: 'carpooling', label: 'Carpooling' },
  { value: 'water_saving', label: 'Water Saving' },
];

export default function ActivitiesPage() {
  const { refreshUser } = useAuth();
  const [activities, setActivities] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedType, setSelectedType] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const [a, s] = await Promise.all([activityAPI.list(0, 50), activityAPI.stats()]);
    setActivities(a.data);
    setStats(s.data);
  };

  const handleLog = async (e) => {
    e.preventDefault();
    if (!selectedType) return;
    setLoading(true);
    try {
      await activityAPI.log({ activity_type: selectedType, description });
      setSuccess('Activity logged!');
      setSelectedType(''); setDescription('');
      await loadData(); await refreshUser();
      setTimeout(() => setSuccess(''), 3000);
    } finally { setLoading(false); }
  };

  return (
    <div className="animate-fade-in">
      <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '8px' }}>
        <Footprints size={24} style={{ display: 'inline', marginRight: 8, verticalAlign: 'text-bottom' }} />
        Activity Tracker
      </h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>Log eco-friendly actions and earn points.</p>

      {success && <div style={{ padding: '12px 16px', borderRadius: 'var(--radius)', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: 'var(--color-primary)', marginBottom: 20, fontSize: '0.875rem' }}>{success}</div>}

      <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><Plus size={18} /> Log New Activity</h3>
        <form onSubmit={handleLog}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8, marginBottom: 16 }}>
            {TYPES.map(({ value, label }) => (
              <button key={value} type="button" onClick={() => setSelectedType(value)} style={{
                padding: 12, borderRadius: 'var(--radius)',
                background: selectedType === value ? 'rgba(16,185,129,0.15)' : 'var(--bg-secondary)',
                border: selectedType === value ? '2px solid var(--color-primary)' : '1px solid var(--border-color)',
                color: selectedType === value ? 'var(--color-primary)' : 'var(--text-secondary)',
                cursor: 'pointer', fontSize: '0.8rem', fontWeight: selectedType === value ? 600 : 400, transition: 'all 0.2s ease',
              }}>{label}</button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <input className="input" placeholder="Description (optional)" value={description} onChange={e => setDescription(e.target.value)} style={{ flex: 1 }} />
            <button type="submit" className="btn btn-primary" disabled={!selectedType || loading}>{loading ? 'Logging...' : 'Log Activity'}</button>
          </div>
        </form>
      </div>

      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
          <div className="stat-card"><div className="stat-value" style={{ color: 'var(--color-primary)' }}>{stats.total_activities}</div><div className="stat-label">Total Activities</div></div>
          <div className="stat-card"><div className="stat-value" style={{ color: 'var(--color-secondary)' }}>{stats.total_co2_saved_kg.toFixed(1)} kg</div><div className="stat-label">CO2 Saved</div></div>
          <div className="stat-card"><div className="stat-value" style={{ color: 'var(--color-accent)' }}>{stats.total_points}</div><div className="stat-label">Points Earned</div></div>
        </div>
      )}

      <div className="glass-card" style={{ padding: 24 }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16 }}>Activity History</h3>
        {activities.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {activities.map((a, i) => (
              <div key={a.id} className="animate-slide-in" style={{ animationDelay: `${i * 0.03}s`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: 'var(--radius)', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                <div>
                  <p style={{ fontWeight: 600, fontSize: '0.85rem', textTransform: 'capitalize' }}>{a.activity_type.replace('_', ' ')}</p>
                  {a.description && <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{a.description}</p>}
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>{a.activity_date}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="badge badge-green">+{a.points_earned} pts</span>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: 2 }}>{a.co2_saved_kg} kg CO2</p>
                </div>
              </div>
            ))}
          </div>
        ) : <p style={{ color: 'var(--text-muted)' }}>No activities yet.</p>}
      </div>
    </div>
  );
}
