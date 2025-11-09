import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthProvider';
import CircularProgress from '../components/CircularProgress';

export default function AddArticle() {
    const { user } = useContext(AuthContext);
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const frontendUrl = import.meta.env.VITE_FRONTEND_URL;

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [currentTag, setCurrentTag] = useState('');
    const [tags, setTags] = useState([]);
    const [currentRef, setCurrentRef] = useState('');
    // store only UUID parts here
    const [references, setReferences] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    const escapeRegExp = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const refRegex = new RegExp(`^${escapeRegExp(frontendUrl)}/articles/([0-9a-fA-F-]{36})$`);

    const handleAddTag = () => {
        const t = currentTag.trim();
        if (!t) return;
        setTags((prev) => [...prev, t]);
        setCurrentTag('');
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
                text: `Reference must match: ${frontendUrl}/articles/:uuid (uuid v4 format)`,
                type: 'error'
            });
        }
        const uuid = m[1];
        // avoid duplicates
        setReferences((prev) => (prev.includes(uuid) ? prev : [...prev, uuid]));
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
        setMessage({ text: '', type: '' });

        if (!validateForm()) return;

        setLoading(true);

        // token from useAuth() as requested; fallback to localStorage if not present
        const token = user?.token || user?.user?.token || localStorage.getItem('token');

        const payload = {
            token,
            title: title.trim(),
            content: content.trim(),
            tags,
            // send uuids only as requested
            references
        };

        try {
            const res = await fetch(`${backendUrl}/add-article`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                credentials: 'include'
            });

            let data;
            try {
                data = await res.json();
            } catch (jsonErr) {
                // response not JSON
                throw new Error(`Unexpected response from server (status ${res.status})`);
            }

            if (!res.ok) {
                // careful with message propagation
                const errMsg = data?.message || `Server responded with ${res.status}`;
                throw new Error(errMsg);
            }

            setMessage({ text: data.message || 'Article added successfully', type: 'success' });
            // reset form
            setTitle('');
            setContent('');
            setTags([]);
            setReferences([]);
            setCurrentRef('');
            setCurrentTag('');
        } catch (err) {
            // network or server error
            const text = err?.message || 'Unable to reach API';
            setMessage({ text, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '900px', margin: '2rem auto', padding: '0 1rem' }}>
            <h1 style={{ color: '#2563eb', marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 'bold' }}>
                Add New Article
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
                {/* Title */}
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

                {/* Content */}
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

                {/* Tags */}
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

                {/* References */}
                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                        References
                    </label>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <input
                            value={currentRef}
                            onChange={(e) => setCurrentRef(e.target.value)}
                            disabled={loading}
                            placeholder={`${frontendUrl}/articles/:uuid`}
                            style={{
                                flex: 1,
                                padding: '0.65rem',
                                borderRadius: '0.375rem',
                                border: '1px solid #e5e7eb',
                                fontSize: '1rem'
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
                        {references.map((uuid, i) => {
                            const full = `${frontendUrl}/articles/${uuid}`;
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
                                    <a
                                        href={full}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ color: '#2563eb', wordBreak: 'break-all' }}
                                    >
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

                {/* Submit */}
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
                        {loading ? <CircularProgress size={24} color="#fff" /> : 'Submit Article'}
                    </button>
                </div>
            </form>
        </div>
    );
}
