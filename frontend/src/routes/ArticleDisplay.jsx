import React, { useState, useEffect } from 'react';
import {Link, useNavigate, useParams} from 'react-router-dom';
import CircularProgress from '../components/CircularProgress';

export default function ArticleDisplay() {
    const { uuid } = useParams();
    const [article, setArticle] = useState(null);
    const [tags, setTags] = useState(null);
    const [refs, setRefs] = useState(null);
    const [refTitles , setRefTitles] = useState(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        const fetchArticle = async () => {
            setLoading(true);
            setMessage({ text: '', type: '' });

            try {
                const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/article/${uuid}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ token: localStorage.getItem('token') })
                });
                const t = await fetch(`${import.meta.env.VITE_BACKEND_URL}/tags/${uuid}`, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    credentials: 'include',
                    body: JSON.stringify({token: localStorage.getItem('token')})
                })
                const r = await fetch(`${import.meta.env.VITE_BACKEND_URL}/references/${uuid}`, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    credentials: 'include',
                    body: JSON.stringify({token: localStorage.getItem('token')})
                })

                let data , tag, ref;
                try {
                    data = await res.json();
                    tag = await t.json()
                    ref = await r.json()
                } catch {
                    throw new Error('Invalid response from server');
                }

                if (!res.ok) {
                    throw new Error(data?.message || `Error ${res.status}`);
                }

                setArticle(data);
                setTags(tag);
                setRefs(ref);
                console.log(ref)
                const titles = await Promise.all(
                    ref.map(async (elem) => {
                        const uuid = elem.to_article_id;
                        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/article/${uuid}`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            credentials: 'include',
                            body: JSON.stringify({ token: localStorage.getItem('token') })
                        });
                        const art = await res.json();
                        return art.title;
                    })
                );
                setRefTitles(titles);
            } catch (err) {
                setMessage({ text: err.message || 'Error loading article', type: 'error' });
            } finally {
                setLoading(false);
            }
        };

        fetchArticle();
    }, [uuid]);

    return (
        <div style={{ maxWidth: '900px', margin: '2rem auto', padding: '0 1rem' }}>
            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '4rem' }}>
                    <CircularProgress size={36} color="#2563eb" />
                </div>
            ) : message.text ? (
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
            ) : (
                <div>
                    <h1
                        style={{
                            color: '#2563eb',
                            marginBottom: '1rem',
                            fontSize: '1.75rem',
                            fontWeight: 'bold',
                            lineHeight: 1.2
                        }}
                    >
                        {article.title}
                    </h1>

                    <div
                        style={{
                            whiteSpace: 'pre-wrap',
                            lineHeight: 1.6,
                            fontSize: '1.05rem',
                            color: '#374151',
                            backgroundColor: '#f9fafb',
                            padding: '1rem',
                            borderRadius: '0.375rem',
                            border: '1px solid #e5e7eb'
                        }}
                    >
                        {article.content}
                    </div>
                <div>
                    <h4>TAGS</h4>
                    <ul>{tags ? tags.map((elem) => <li key={elem.tagName} style={{
                        listStyle : "none"
                    }}>#{elem.tagName}</li>) : " "}
                        </ul>
                </div>
                <div>
                    <h4>References</h4>
                    <ul>
                        {refs ? refs.map((elem, index) => <li key={elem.to_article_id}>
                            <Link to={`/article/${elem.to_article_id}`}>
                                {`${import.meta.env.VITE_BACKEND_URL}/article/${elem.to_article_id}`}
                            </Link>
                            <h6>
                                {refTitles[index]}
                            </h6>
                        </li> ) : " "}
                    </ul>
                </div>
                </div>
            )}
        </div>
    );
}
