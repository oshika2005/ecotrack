import { useState, useEffect } from 'react';
import { challengeAPI, leaderboardAPI } from '../services/api';
import { Trophy, Medal, Target } from 'lucide-react';

export default function ChallengesPage() {
  const [challenges, setChallenges] = useState([]);
  const [myChallenges, setMyChallenges] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [tab, setTab] = useState('challenges');

  useEffect(() => {
    challengeAPI.list().then(r => setChallenges(r.data));
    challengeAPI.my().then(r => setMyChallenges(r.data)).catch(() => {});
    leaderboardAPI.get(10).then(r => setLeaderboard(r.data));
  }, []);

  const joinChallenge = async (id) => {
    await challengeAPI.join(id);
    const r = await challengeAPI.my();
    setMyChallenges(r.data);
  };

  const joinedIds = new Set(myChallenges.map(c => c.challenge.id));
  const diffColors = { easy: 'badge-green', medium: 'badge-amber', hard: 'badge-red' };

  return (
    <div className="animate-fade-in">
      <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: 8 }}>
        <Trophy size={24} style={{ display: 'inline', marginRight: 8, verticalAlign: 'text-bottom' }} />
        Challenges & Leaderboard
      </h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>Complete challenges, earn points, climb the ranks!</p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {['challenges', 'leaderboard'].map(t => (
          <button key={t} onClick={() => setTab(t)} className={`btn ${tab === t ? 'btn-primary' : 'btn-secondary'}`} style={{ textTransform: 'capitalize' }}>{t === 'challenges' ? <Target size={16} /> : <Medal size={16} />}{t}</button>
        ))}
      </div>

      {tab === 'challenges' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {challenges.map((c, i) => (
            <div key={c.id} className="glass-card animate-fade-in" style={{ padding: 20, animationDelay: `${i * 0.05}s` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span className={`badge ${diffColors[c.difficulty]}`}>{c.difficulty}</span>
                <span className="badge badge-amber">{c.points_reward} pts</span>
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 6 }}>{c.title}</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 12, lineHeight: 1.5 }}>{c.description}</p>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 12 }}>{c.start_date} to {c.end_date}</div>
              {joinedIds.has(c.id) ? <span className="badge badge-green">Joined</span> : <button onClick={() => joinChallenge(c.id)} className="btn btn-primary" style={{ width: '100%' }}>Join Challenge</button>}
            </div>
          ))}
        </div>
      )}

      {tab === 'leaderboard' && (
        <div className="glass-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {leaderboard.map((entry, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderRadius: 'var(--radius)', background: i < 3 ? 'rgba(16,185,129,0.05)' : 'var(--bg-secondary)', border: `1px solid ${i < 3 ? 'rgba(16,185,129,0.2)' : 'var(--border-color)'}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: i === 0 ? 'linear-gradient(135deg, #f59e0b, #f97316)' : i === 1 ? 'linear-gradient(135deg, #94a3b8, #cbd5e1)' : i === 2 ? 'linear-gradient(135deg, #d97706, #b45309)' : 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem', color: i < 3 ? 'white' : 'var(--text-secondary)' }}>
                    {entry.rank}
                  </div>
                  <div>
                    <p style={{ fontWeight: 600 }}>{entry.username}</p>
                    <span className="badge badge-green" style={{ fontSize: '0.65rem' }}>{entry.badge_level}</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontWeight: 700, color: 'var(--color-accent)' }}>{entry.total_points} pts</p>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{entry.total_co2_saved_kg} kg saved</p>
                </div>
              </div>
            ))}
            {leaderboard.length === 0 && <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 20 }}>No users on the leaderboard yet.</p>}
          </div>
        </div>
      )}
    </div>
  );
}
