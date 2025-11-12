import React, { useState } from 'react';
import CircularProgress from '../../components/CircularProgress';
import { useNavigate } from 'react-router-dom';

export default function SearchTags() {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [currentTag, setCurrentTag] = useState('');
  const [tags, setTags] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const navigate = useNavigate();

  const addTag = () => {
    const t = currentTag.trim();
    if (!t) {
      setMessage({ text: 'Tag cannot be empty', type: 'error' });
      return;
    }
    if (tags.includes(t)) {
      setMessage({ text: 'Tag already added', type: 'error' });
      return;
    }
    setTags(prev => [...prev, t]);
    setCurrentTag('');
    setMessage({ text: '', type: '' });
  };

  const removeTag = (idx) => {
    setTags(prev => prev.filter((_, i) => i !== idx));
  };

  const clearAll = () => {
    setTags([]);
    setResults([]);
    setMessage({ text: '', type: '' });
    setCurrentTag('');
  };

  const handleSearch = async () => {
    setMessage({ text: '', type: '' });
    if (tags.length === 0) {
      setMessage({ text: 'Add at least one tag to search', type: 'error' });
      return;
    }

    setLoading(true);
    setResults([]);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${backendUrl}/search/searchbytag`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ token, query: tags })
      });

      let data;
      try {
        data = await res.json();
      } catch (err) {
        throw new Error(`Unexpected response from server (status ${res.status})`);
      }

      if (!res.ok) {
        throw new Error(data?.message || `Server error: ${res.status}`);
      }

      setResults(Array.isArray(data) ? data : []);
      if (!Array.isArray(data) || data.length === 0) {
        setMessage({ text: data?.message || 'No articles found', type: 'info' });
      }
    } catch (err) {
      setMessage({ text: err.message || 'Unable to reach server', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <nav style={{ display: 'flex', marginBottom: '20px', alignItems: 'center', backgroundColor: '#1427d0ff', padding: '6px 12px', borderRadius: '5px' }}>
        <h1 style={{ marginLeft: '1rem', color: 'white' }}>Search By Tag</h1>
      </nav>

      <div style={{ maxWidth: 900, width: '100%', marginBottom: 16 }}>
        {message.text && (
          <div style={{
            padding: '10px',
            marginBottom: 12,
            borderRadius: 6,
            backgroundColor: message.type === 'error' ? '#fee2e2' : (message.type === 'info' ? '#eef2ff' : '#ecfdf5'),
            color: message.type === 'error' ? '#991b1b' : '#064e3b',
            border: message.type === 'error' ? '1px solid #fecaca' : '1px solid #d1fae5'
          }}>
            {message.text}
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <input
            value={currentTag}
            onChange={(e) => setCurrentTag(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
            placeholder="Enter tag (single word)"
            style={{ flex: 1, padding: 10, fontSize: 14, border: '1px solid #cbd5e1', borderRadius: 6 }}
            disabled={loading}
          />
          <button type="button" onClick={addTag} disabled={loading} style={{ padding: '10px 12px', background: '#1e40af', color: 'white', borderRadius: 6, border: 'none' }}>
            Add Tag
          </button>
          <button type="button" onClick={handleSearch} disabled={loading} style={{ padding: '10px 12px', background: '#059669', color: 'white', borderRadius: 6, border: 'none' }}>
            {loading ? <CircularProgress size={18} color="#fff" /> : 'Search'}
          </button>
          <button type="button" onClick={clearAll} disabled={loading} style={{ padding: '10px 12px', background: '#64748b', color: 'white', borderRadius: 6, border: 'none' }}>
            Clear
          </button>
        </div>

        <div style={{ marginBottom: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {tags.length === 0 && <div style={{ color: '#64748b' }}>No tags added</div>}
          {tags.map((t, i) => (
            <div key={t + i} style={{ background: '#7549faff', color: 'white', padding: '6px 8px', borderRadius: 999, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <span>{t}</span>
              <button onClick={() => removeTag(i)} disabled={loading} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>×</button>
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 900, width: '100%' }}>
        {loading ? (
          <CircularProgress />
        ) : results.length > 0 ? (
          results.map((article) => (
            <div key={article.article_id} style={{ display: 'flex', alignItems: 'center', marginBottom: 12, padding: 12, border: '1px solid #e2e8f0', borderRadius: 6 }}>
              <div style={{ flex: 4 }}>
                <a
                  href={`/article/${article.article_id}`}
                  onClick={(e) => { e.preventDefault(); navigate(`/article/${article.article_id}`); }}
                  style={{ marginRight: 10, color: '#0f172a', textDecoration: 'none', fontWeight: 600 }}
                >
                  {article.title}
                </a>
                <div style={{ color: '#475569', fontSize: 13, marginTop: 6 }}>{article.content ? `${article.content.slice(0, 200)}${article.content.length > 200 ? '...' : ''}` : ''}</div>
              </div>
              <div style={{ flex: 1 }}>
                <div><b>By:</b> {article.username}</div>
              </div>
            </div>
          ))
        ) : (
          <div style={{ color: '#64748b' }}>No articles found</div>
        )}
      </div>
    </div>
  );
}