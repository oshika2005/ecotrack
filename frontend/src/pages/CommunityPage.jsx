import { useState, useEffect } from 'react';
import { communityAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Users, Heart, MessageCircle, Send } from 'lucide-react';

export default function CommunityPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [commentText, setCommentText] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadPosts(); }, []);

  const loadPosts = async () => {
    const r = await communityAPI.listPosts();
    setPosts(r.data);
  };

  const handlePost = async (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;
    setLoading(true);
    await communityAPI.createPost({ content: newPost });
    setNewPost('');
    await loadPosts();
    setLoading(false);
  };

  const handleLike = async (id) => {
    await communityAPI.likePost(id);
    await loadPosts();
  };

  const handleComment = async (postId) => {
    const text = commentText[postId];
    if (!text?.trim()) return;
    await communityAPI.addComment(postId, { content: text });
    setCommentText({ ...commentText, [postId]: '' });
    await loadPosts();
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: 700 }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: 8 }}>
        <Users size={24} style={{ display: 'inline', marginRight: 8, verticalAlign: 'text-bottom' }} />
        Community Hub
      </h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>Share eco tips and inspire others.</p>

      <form onSubmit={handlePost} className="glass-card" style={{ padding: 20, marginBottom: 24 }}>
        <textarea className="input" rows={3} placeholder="Share an eco tip or green achievement..." value={newPost} onChange={e => setNewPost(e.target.value)} style={{ resize: 'vertical', marginBottom: 12 }} />
        <button type="submit" className="btn btn-primary" disabled={loading || !newPost.trim()}>
          <Send size={14} /> {loading ? 'Posting...' : 'Post'}
        </button>
      </form>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {posts.map((p, i) => (
          <div key={p.id} className="glass-card animate-fade-in" style={{ padding: 20, animationDelay: `${i * 0.05}s` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'white', fontSize: '0.8rem' }}>
                  {(p.username || 'U')[0].toUpperCase()}
                </div>
                <div>
                  <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{p.username}</p>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{new Date(p.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
            <p style={{ fontSize: '0.9rem', lineHeight: 1.6, marginBottom: 12 }}>{p.content}</p>
            <div style={{ display: 'flex', gap: 16, borderTop: '1px solid var(--border-color)', paddingTop: 10 }}>
              <button onClick={() => handleLike(p.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                <Heart size={14} /> {p.likes_count}
              </button>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                <MessageCircle size={14} /> {p.comments_count}
              </span>
            </div>
            {p.comments?.length > 0 && (
              <div style={{ marginTop: 10, paddingLeft: 16, borderLeft: '2px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: 6 }}>
                {p.comments.map(c => (
                  <div key={c.id} style={{ fontSize: '0.8rem' }}>
                    <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{c.username}</span>
                    <span style={{ color: 'var(--text-secondary)', marginLeft: 6 }}>{c.content}</span>
                  </div>
                ))}
              </div>
            )}
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <input className="input" style={{ fontSize: '0.8rem', padding: '6px 12px' }} placeholder="Write a comment..." value={commentText[p.id] || ''} onChange={e => setCommentText({ ...commentText, [p.id]: e.target.value })} onKeyDown={e => e.key === 'Enter' && handleComment(p.id)} />
              <button onClick={() => handleComment(p.id)} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>Reply</button>
            </div>
          </div>
        ))}
        {posts.length === 0 && <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 40 }}>No posts yet. Be the first to share!</p>}
      </div>
    </div>
  );
}
