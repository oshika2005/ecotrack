import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { activityAPI, carbonAPI } from '../services/api';
import { Leaf, Zap, TrendingDown, Award, Activity } from 'lucide-react';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, ArcElement, Tooltip, Legend, Filler
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler);

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [trends, setTrends] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      activityAPI.stats().catch(() => ({ data: { total_activities: 0, total_co2_saved_kg: 0, total_points: 0, activities_by_type: {} } })),
      carbonAPI.trends(30).catch(() => ({ data: { dates: [], total_co2: [], electricity_co2: [], food_co2: [], travel_co2: [] } })),
      activityAPI.list(0, 5).catch(() => ({ data: [] })),
    ]).then(([statsRes, trendsRes, activitiesRes]) => {
      setStats(statsRes.data);
      setTrends(trendsRes.data);
      setRecentActivities(activitiesRes.data);
      setLoading(false);
    });
  }, []);

  const statCards = [
    { icon: Leaf, label: 'CO2 Saved', value: `${stats?.total_co2_saved_kg?.toFixed(1) || 0} kg`, color: 'var(--color-primary)' },
    { icon: Zap, label: 'Total Points', value: user?.total_points || 0, color: 'var(--color-accent)' },
    { icon: Award, label: 'Badge Level', value: user?.badge_level || 'Eco Beginner', color: 'var(--color-secondary)' },
    { icon: Activity, label: 'Activities', value: stats?.total_activities || 0, color: '#a78bfa' },
  ];

  const trendChartData = {
    labels: trends?.dates?.map(d => d.slice(5)) || [],
    datasets: [
      {
        label: 'Total CO2 (kg)',
        data: trends?.total_co2 || [],
        borderColor: 'rgba(16, 185, 129, 1)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 6,
      },
      {
        label: 'Travel',
        data: trends?.travel_co2 || [],
        borderColor: 'rgba(6, 182, 212, 0.8)',
        backgroundColor: 'transparent',
        tension: 0.4,
        pointRadius: 2,
        borderDash: [5, 5],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: 'var(--text-secondary)', font: { size: 11 } } },
    },
    scales: {
      x: { ticks: { color: 'var(--text-muted)', font: { size: 10 } }, grid: { color: 'rgba(100,116,139,0.1)' } },
      y: { ticks: { color: 'var(--text-muted)', font: { size: 10 } }, grid: { color: 'rgba(100,116,139,0.1)' } },
    },
  };

  const activityTypes = stats?.activities_by_type || {};
  const doughnutData = {
    labels: Object.keys(activityTypes),
    datasets: [{
      data: Object.values(activityTypes),
      backgroundColor: ['#10b981', '#06b6d4', '#f59e0b', '#a78bfa', '#f472b6', '#fb923c', '#34d399', '#94a3b8'],
      borderWidth: 0,
    }],
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div className="animate-pulse-glow" style={{
          width: '60px', height: '60px', borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Leaf size={28} color="white" />
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>
          Welcome back, <span className="gradient-text">{user?.username || 'User'}</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
          Track your environmental impact and make a difference.
        </p>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        {statCards.map(({ icon: Icon, label, value, color }, i) => (
          <div key={label} className="stat-card animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '42px', height: '42px', borderRadius: '12px',
                background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={20} color={color} />
              </div>
              <div>
                <div className="stat-value" style={{ color }}>{value}</div>
                <div className="stat-label">{label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '32px' }}>
        {/* Trend Chart */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px' }}>
            <TrendingDown size={18} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'text-bottom' }} />
            Carbon Footprint Trend
          </h3>
          <div style={{ height: '280px' }}>
            {trends?.dates?.length > 0 ? (
              <Line data={trendChartData} options={chartOptions} />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                <p>Log your first carbon footprint to see trends!</p>
              </div>
            )}
          </div>
        </div>

        {/* Activity Distribution */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px' }}>Activity Breakdown</h3>
          <div style={{ height: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {Object.keys(activityTypes).length > 0 ? (
              <Doughnut data={doughnutData} options={{ ...chartOptions, cutout: '65%' }} />
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center' }}>
                No activities yet. Log your first eco action!
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px' }}>Recent Activities</h3>
        {recentActivities.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {recentActivities.map((a, i) => (
              <div key={a.id} className="animate-slide-in" style={{
                animationDelay: `${i * 0.05}s`,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 16px', borderRadius: 'var(--radius)',
                background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '8px',
                    background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Leaf size={14} color="var(--color-primary)" />
                  </div>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: '0.85rem', textTransform: 'capitalize' }}>
                      {a.activity_type.replace('_', ' ')}
                    </p>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{a.activity_date}</p>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="badge badge-green">+{a.points_earned} pts</span>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {a.co2_saved_kg} kg saved
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            No activities yet. Start tracking your eco-friendly actions!
          </p>
        )}
      </div>
    </div>
  );
}
