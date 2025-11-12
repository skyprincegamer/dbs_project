import React, { useState } from 'react';
import CircularProgress from '../../components/CircularProgress';

export default function TagSearch() {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const frontendUrl = import.meta.env.VITE_FRONTEND_URL;

  const [currentTag, setCurrentTag] = useState('');
  const [topOp, setTopOp] = useState('AND'); // top-level operator for main group
  const [topTags, setTopTags] = useState([]); // tags that belong to topOp
  const [orTags, setOrTags] = useState([]);   // will be nested as { OR: [...] }
  const [notTags, setNotTags] = useState([]); // will be nested as {not: tag}
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const addTagTo = (group) => {
    const t = currentTag.trim();
    if (!t) return setMessage({ text: 'Enter a tag', type: 'error' });
    setMessage({ text: '', type: '' });
    if (group === 'TOP') {
      if (!topTags.includes(t)) setTopTags(prev => [...prev, t]);
    } else if (group === 'OR') {
      if (!orTags.includes(t)) setOrTags(prev => [...prev, t]);
    } else if (group === 'NOT') {
      if (!notTags.includes(t)) setNotTags(prev => [...prev, t]);
    }
    setCurrentTag('');
  };

  const removeTagFrom = (group, idx) => {
    if (group === 'TOP') setTopTags(prev => prev.filter((_, i) => i !== idx));
    if (group === 'OR') setOrTags(prev => prev.filter((_, i) => i !== idx));
    if (group === 'NOT') setNotTags(prev => prev.filter((_, i) => i !== idx));
  };

  const moveTag = (fromGroup, toGroup, idx) => {
    let tag;
    if (fromGroup === 'TOP') tag = topTags[idx];
    if (fromGroup === 'OR') tag = orTags[idx];
    if (fromGroup === 'NOT') tag = notTags[idx];
    if (!tag) return;
    removeTagFrom(fromGroup, idx);
    if (toGroup === 'TOP') setTopTags(prev => (prev.includes(tag) ? prev : [...prev, tag]));
    if (toGroup === 'OR') setOrTags(prev => (prev.includes(tag) ? prev : [...prev, tag]));
    if (toGroup === 'NOT') setNotTags(prev => (prev.includes(tag) ? prev : [...prev, tag]));
  };

  // Build query object compatible with backend helper (examples: { OR: [...] }, { AND: [...] }, {not: "CSS"})
  const buildQueryObject = () => {
    const parts = [];
    // top tags as plain strings
    topTags.forEach(t => parts.push(t));
    // OR group nested
    if (orTags.length > 0) parts.push({ OR: orTags });
    // NOTs as separate {not: tag}
    notTags.forEach(t => parts.push({ not: t }));
    if (parts.length === 0) return null;
    if (parts.length === 1 && typeof parts[0] === 'string') {
      // simplest: single tag string
      return parts[0];
    }
    // wrap under topOp: { AND: [...parts] } or { OR: [...parts] }
    return { [topOp]: parts };
  };

  const handleSearch = async () => {
    setMessage({ text: '', type: '' });
    const queryObj = buildQueryObject();
    console.log(queryObj);
    if (!queryObj) {
      setMessage({ text: 'Add at least one tag before searching', type: 'error' });
      return;
    }
    setLoading(true);
    setResults([]);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${backendUrl}/search/searchbytags`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ token, query: queryObj })
      });
      let data;
      try { data = await res.json(); } catch { throw new Error(`Unexpected server response (status ${res.status})`); }

      if (!res.ok) {
        throw new Error(data?.message || `Server error: ${res.status}`);
      }
      setResults(Array.isArray(data) ? data : []);
      if (!data || (Array.isArray(data) && data.length === 0)) {
        setMessage({ text: 'No articles found', type: 'info' });
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
        <h1 style={{ marginLeft: '1rem', color: 'white' }}>Search By Tags (AND / OR / NOT)</h1>
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
            placeholder="Enter tag (single word)"
            style={{ flex: 1, padding: 10, fontSize: 14, border: '1px solid #cbd5e1', borderRadius: 6 }}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTagTo('TOP'); } }}
          />
          <button type="button" onClick={() => addTagTo('TOP')} style={{ padding: '10px 12px', background: '#1e40af', color: 'white', borderRadius: 6, border: 'none' }}>Add (Top)</button>
          <button type="button" onClick={() => addTagTo('OR')} style={{ padding: '10px 12px', background: '#0ea5a2', color: 'white', borderRadius: 6, border: 'none' }}>Add OR</button>
          <button type="button" onClick={() => addTagTo('NOT')} style={{ padding: '10px 12px', background: '#b91c1c', color: 'white', borderRadius: 6, border: 'none' }}>Add NOT</button>
        </div>

        <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
              <label style={{ fontWeight: 600 }}>Top operator:</label>
              <select value={topOp} onChange={(e) => setTopOp(e.target.value)} style={{ padding: 6, borderRadius: 6 }}>
                <option value="AND">AND</option>
                <option value="OR">OR</option>
              </select>
            </div>
            <div style={{ padding: 10, border: '1px solid #e6edf3', borderRadius: 6 }}>
              <div style={{ fontSize: 13, marginBottom: 8, color: '#334155' }}>Top group ({topOp})</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {topTags.length === 0 && <div style={{ color: '#64748b' }}>No tags</div>}
                {topTags.map((t, i) => (
                  <div key={t + i} style={{ background: '#f1f5f9', padding: '6px 8px', borderRadius: 999, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    <span>{t}</span>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => removeTagFrom('TOP', i)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>×</button>
                      <select onChange={(e) => moveTag('TOP', e.target.value, i)} defaultValue="">
                        <option value="" disabled style={{display:'none'}}>→</option>
                        <option value="OR">Move to OR</option>
                        <option value="NOT">Move to NOT</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ width: 260 }}>
            <div style={{ fontSize: 13, marginBottom: 8, color: '#334155' }}>OR group</div>
            <div style={{ padding: 10, border: '1px solid #e6edf3', borderRadius: 6, minHeight: 80 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {orTags.length === 0 && <div style={{ color: '#64748b' }}>No tags</div>}
                {orTags.map((t, i) => (
                  <div key={t + i} style={{ background: '#fff7ed', padding: '6px 8px', borderRadius: 999, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    <span>{t}</span>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => removeTagFrom('OR', i)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>×</button>
                      <select onChange={(e) => moveTag('OR', e.target.value, i)} defaultValue="">
                        <option value="" disabled style={{display:'none'}}>→</option>
                        <option value="TOP">Move to Top</option>
                        <option value="NOT">Move to NOT</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ fontSize: 13, marginTop: 12, marginBottom: 8, color: '#334155' }}>NOT group</div>
            <div style={{ padding: 10, border: '1px solid #e6edf3', borderRadius: 6, minHeight: 80 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {notTags.length === 0 && <div style={{ color: '#64748b' }}>No tags</div>}
                {notTags.map((t, i) => (
                  <div key={t + i} style={{ background: '#fef2f2', padding: '6px 8px', borderRadius: 999, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    <span>{t}</span>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => removeTagFrom('NOT', i)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>×</button>
                      <select onChange={(e) => moveTag('NOT', e.target.value, i)} defaultValue="">
                        <option value="" disabled style={{display:'none'}}>→</option>
                        <option value="TOP">Move to Top</option>
                        <option value="OR">Move to OR</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={handleSearch} disabled={loading} style={{ padding: '10px 14px', background: '#1e40af', color: 'white', borderRadius: 6, border: 'none' }}>
            {loading ? <CircularProgress size={18} color="#fff" /> : 'Search by tags'}
          </button>
          <button onClick={() => { setTopTags([]); setOrTags([]); setNotTags([]); setResults([]); setMessage({ text: '', type: '' }); }} style={{ padding: '10px 14px', background: '#64748b', color: 'white', borderRadius: 6, border: 'none' }}>
            Clear
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 900, width: '100%' }}>
        {loading ? (
          <CircularProgress />
        ) : results.length > 0 ? (
          results.map((article) => (
            <div key={article.article_id} style={{ display: 'flex', alignItems: 'center', marginBottom: 12, padding: 12, border: '1px solid #e2e8f0', borderRadius: 6 }}>
              <div style={{ flex: 4 }}>
                <a href={`/article/${article.article_id}`} style={{ marginRight: 10, color: '#0f172a', textDecoration: 'none', fontWeight: 600 }}>
                  {article.title}
                </a>
                <div style={{ color: '#475569', fontSize: 13, marginTop: 6 }}>{article.content ? `${article.content.slice(0,200)}${article.content.length>200?'...':''}` : ''}</div>
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