import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthProvider';
import CircularProgress from '../components/CircularProgress';

export default function ArticleEdit() {
  const { uuid } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const frontendUrl = import.meta.env.VITE_FRONTEND_URL;

  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [currentTag, setCurrentTag] = useState('');
  const [tags, setTags] = useState([]);
  const [currentRef, setCurrentRef] = useState('');
  const [references, setReferences] = useState([]); // store only UUIDs

  const [notAuthorized, setNotAuthorized] = useState(false);

  const escapeRegExp = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const refRegex = new RegExp(`^${escapeRegExp(frontendUrl)}/article/([0-9a-fA-F-]{36})$`);

  useEffect(() => {
    const fetchArticle = async () => {
      setFetching(true);
      setMessage({ text: '', type: '' });

      try {
        const token = user?.token || localStorage.getItem('token');

        // fetch article, tags and references in parallel
        const artP = fetch(`${backendUrl}/article/${uuid}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ token })
        });
        const tagsP = fetch(`${backendUrl}/tags/${uuid}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ token })
        });
        const refsP = fetch(`${backendUrl}/references/${uuid}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ token })
        });

        const [artRes, tagsRes, refsRes] = await Promise.all([artP, tagsP, refsP]);

        const artJson = await artRes.json().catch(() => null);
        const tagsJson = await tagsRes.json().catch(() => null);
        const refsJson = await refsRes.json().catch(() => null);

        if (!artRes.ok) {
          const errMsg = artJson?.message || `Failed to load article (${artRes.status})`;
          throw new Error(errMsg);
        }

        // ownership check: article object may have id / user_id fields
        const ownerId = artJson?.id ?? artJson?.user_id ?? artJson?.userId;
        const currentUserId =
          user?.userId ?? user?.id ?? user?._id ?? user?.user?.userId ?? user?.user?.id;

        if (typeof ownerId !== 'undefined' && typeof currentUserId !== 'undefined') {
          if (String(ownerId) !== String(currentUserId)) {
            setNotAuthorized(true);
            setMessage({ text: 'You are not authorized to edit this article', type: 'error' });
            return;
          }
        }
        // populate form fields
        setTitle(artJson?.title ?? '');
        setContent(artJson?.content ?? '');

        // tags endpoint expected to return array of { tagName }
        if (Array.isArray(tagsJson)) {
          setTags(tagsJson.map((t) => t.tagName));
        } else {
          setTags([]);
        }

        // references endpoint expected to return array of { to_article_id }
        if (Array.isArray(refsJson)) {
          setReferences(refsJson.map((r) => r.to_article_id));
        } else {
          setReferences([]);
        }
      } catch (err) {
        setMessage({ text: err.message || 'Unable to load article', type: 'error' });
      } finally {
        setFetching(false);
      }
    };

    fetchArticle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uuid, user]);

  const handleAddTag = () => {
    const t = currentTag.trim();
    if (!t) return;
    if (tags.includes(t)) {
      setMessage({ text: 'Tag already added', type: 'error' });
      return;
    }
    setTags((prev) => [...prev, t]);
    setCurrentTag('');
    setMessage({ text: '', type: '' });
  };

  const handleRemoveTag = (indexToRemove) => {
    setTags((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

  const handleAddReference = () => {
    setMessage({ text: '', type: '' });
    const ref = currentRef.trim();
    if (!ref) return setMessage({ text: 'Reference cannot be empty', type: 'error' });

    const m = ref.match(refRegex);
    if (!m) {
      return setMessage({
        text: `Reference must match: ${frontendUrl}/article/:uuid`,
        type: 'error'
      });
    }
    const uuidPart = m[1];
    setReferences((prev) => (prev.includes(uuidPart) ? prev : [...prev, uuidPart]));
    setCurrentRef('');
  };

  const handleRemoveReference = (indexToRemove) => {
    setReferences((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

  const validateForm = () => {
    if (!title.trim()) {
      setMessage({ text: 'Title is required', type: 'error' });
      return false;
    }
    if (!content.trim()) {
      setMessage({ text: 'Content is required', type: 'error' });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (notAuthorized) return;
    if (!validateForm()) return;

    setLoading(true);
    setMessage({ text: '', type: '' });
    try {
      const token = user?.token || localStorage.getItem('token');
      const payload = {
        token,
        article_id: uuid,
        title: title.trim(),
        content: content.trim(),
        tags,
        references
      };

      const res = await fetch(`${backendUrl}/article/edit`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      let data;
      try {
        data = await res.json();
      } catch {
        throw new Error(`Unexpected response from server (status ${res.status})`);
      }

      if (!res.ok) {
        throw new Error(data?.message || `Server error ${res.status}`);
      }

      // success -> navigate to article view
      setMessage({ text: data?.message || 'Article updated', type: 'success' });
      // small delay to show message then navigate
      setTimeout(() => navigate(`/article/${uuid}`), 650);
    } catch (err) {
      setMessage({ text: err.message || 'Unable to update article', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div style={{ maxWidth: 900, margin: '2rem auto' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '4rem' }}>
          <CircularProgress size={36} color="#2563eb" />
        </div>
      </div>
    );
  }

  if (notAuthorized) {
    return (
      <div style={{ maxWidth: 900, margin: '2rem auto', padding: '0 1rem' }}>
        <div
          style={{
            padding: '1rem',
            borderRadius: 6,
            backgroundColor: '#fee2e2',
            color: '#991b1b'
          }}
        >
          You are not authorized to edit this article.
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: '2rem auto', padding: '0 1rem' }}>
      <h1 style={{ color: '#2563eb', marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 'bold' }}>
        Edit Article
      </h1>

      {message.text && (
        <div
          style={{
            padding: '0.75rem 1rem',
            marginBottom: '1rem',
            borderRadius: '0.375rem',
            backgroundColor: message.type === 'error' ? '#fee2e2' : '#dcfce7',
            color: message.type === 'error' ? '#b91c1c' : '#065f46',
            border: message.type === 'error' ? '1px solid #fecaca' : '1px solid #bbf7d0'
          }}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="title" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
            Title *
          </label>
          <input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            type="text"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '0.375rem',
              border: '1px solid #e5e7eb',
              fontSize: '1rem'
            }}
            required
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="content" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
            Content *
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={loading}
            style={{
              width: '100%',
              minHeight: '220px',
              padding: '0.75rem',
              borderRadius: '0.375rem',
              border: '1px solid #e5e7eb',
              fontSize: '1rem',
              resize: 'vertical'
            }}
            required
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Tags</label>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <input
              value={currentTag}
              onChange={(e) => setCurrentTag(e.target.value)}
              type="text"
              disabled={loading}
              placeholder="Add a tag"
              style={{
                flex: 1,
                padding: '0.65rem',
                borderRadius: '0.375rem',
                border: '1px solid #e5e7eb',
                fontSize: '1rem'
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
            />
            <button
              type="button"
              onClick={handleAddTag}
              disabled={loading}
              style={{
                padding: '0.65rem 1rem',
                backgroundColor: '#2563eb',
                color: '#fff',
                borderRadius: '0.375rem',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Add Tag
            </button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {tags.map((t, i) => (
              <span
                key={i}
                style={{
                  backgroundColor: '#f3f4f6',
                  padding: '0.25rem 0.6rem',
                  borderRadius: '999px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <span style={{ color: '#374151' }}>{t}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTag(i)}
                  disabled={loading}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#6b7280',
                    fontSize: '1rem',
                    lineHeight: 1
                  }}
                  aria-label={`Remove tag ${t}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>References</label>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <input
              value={currentRef}
              onChange={(e) => setCurrentRef(e.target.value)}
              disabled={loading}
              placeholder={`${frontendUrl}/article/:uuid`}
              style={{
                flex: 1,
                padding: '0.65rem',
                borderRadius: '0.375rem',
                border: '1px solid #e5e7eb',
                fontSize: '1rem'
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddReference();
                }
              }}
            />
            <button
              type="button"
              onClick={handleAddReference}
              disabled={loading}
              style={{
                padding: '0.65rem 1rem',
                backgroundColor: '#2563eb',
                color: '#fff',
                borderRadius: '0.375rem',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Add Reference
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {references.map((uuidPart, i) => {
              const full = `${frontendUrl}/article/${uuidPart}`;
              return (
                <div
                  key={i}
                  style={{
                    backgroundColor: '#f9fafb',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '0.375rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <a href={full} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', wordBreak: 'break-all' }}>
                    {full}
                  </a>
                  <button
                    type="button"
                    onClick={() => handleRemoveReference(i)}
                    disabled={loading}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#6b7280',
                      fontSize: '1rem'
                    }}
                    aria-label={`Remove reference ${full}`}
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ marginTop: '1rem' }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: '#2563eb',
              color: '#fff',
              borderRadius: '0.375rem',
              border: 'none',
              cursor: loading ? 'default' : 'pointer',
              fontSize: '1rem',
              fontWeight: 500
            }}
          >
            {loading ? <CircularProgress size={24} color="#fff" /> : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
