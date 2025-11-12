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

    // Rating-related state
    const [showRating, setShowRating] = useState(false); // false = don't render buttons (fetch failed)
    const [ratingStatus, setRatingStatus] = useState(null); // 'up' | 'down' | null
    const [ratingLoading, setRatingLoading] = useState(false);

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

                // fetch rating status for this user/article
                try {
                  const rRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/rating_routes/has_rated`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ token: localStorage.getItem('token'), article_id: uuid })
                  });
                  const rData = await rRes.json();
                  if (!rRes.ok) {
                    // do not show voting UI on failure
                    setShowRating(false);
                  } else {
                    // Interpret server numeric into local status:
                    // server: 1 => upvoted, -1 => downvoted, anything else => not voted
                    if (rData && typeof rData.hasRated !== 'undefined') {
                      if (rData.hasRated === 1) setRatingStatus('up');
                      else if (rData.hasRated === -1) setRatingStatus('down');
                      else setRatingStatus(null);
                      setShowRating(true);
                    } else {
                      setShowRating(false);
                    }
                  }
                } catch (err) {
                  setShowRating(false);
                }

                const titles = ref ? await Promise.all(
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
                ) : null;
                setRefTitles(titles);
            } catch (err) {
                setMessage({ text: err.message || 'Error loading article', type: 'error' });
            } finally {
                setLoading(false);
            }
        };

        fetchArticle();
    }, [uuid]);

    // voteType: 'up' | 'down'
    const handleVote = async (voteType) => {
      if (!showRating) return;
      setMessage({ text: '', type: '' });

      // decide payload vote according to current status and requested action
      // API expects: 1 = upvote, 0 = downvote, -1 = take back vote
      let payloadVote;
      if (voteType === 'up') {
        if (ratingStatus === 'up') {
          payloadVote = -1; // take back
        } else {
          payloadVote = 1; // upvote (also used to switch from down->up)
        }
      } else {
        // down
        if (ratingStatus === 'down') {
          payloadVote = -1; // take back
        } else {
          payloadVote = 0; // downvote (or switch from up->down)
        }
      }

      setRatingLoading(true);
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/rating_routes/rate/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ article_id: uuid, vote: payloadVote, token: localStorage.getItem('token') })
        });
        let data;
        try { data = await res.json(); } catch { throw new Error(`Unexpected response (status ${res.status})`); }
        if (!res.ok) throw new Error(data?.message || `Server error ${res.status}`);

        // adjust local state based on request success
        if (payloadVote === -1) {
          setRatingStatus(null);
        } else if (payloadVote === 1) {
          setRatingStatus('up');
        } else if (payloadVote === 0) {
          setRatingStatus('down');
        }
      } catch (err) {
        setMessage({ text: err.message || 'Unable to send vote', type: 'error' });
      } finally {
        setRatingLoading(false);
      }
    };

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

                    {/* Voting UI (render only if rating fetch succeeded) */}
                    {showRating && (
                      <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center' }}>
                        <button
                          onClick={() => handleVote('up')}
                          disabled={ratingLoading}
                          aria-pressed={ratingStatus === 'up'}
                          title={ratingStatus === 'up' ? 'Remove upvote' : 'Upvote'}
                          style={{
                            padding: '6px 10px',
                            backgroundColor: ratingStatus === 'up' ? '#1e3a8a' : '#eef2ff',
                            color: ratingStatus === 'up' ? '#fff' : '#1e3a8a',
                            border: '1px solid #c7d2fe',
                            borderRadius: 6,
                            cursor: ratingLoading ? 'default' : 'pointer'
                          }}
                        >
                          {ratingLoading ? <CircularProgress size={18} color={ratingStatus === 'up' ? '#fff' : '#1e3a8a'} /> : ((ratingStatus === 'up') ? "▲ Upvoted": '▲ Upvote')}
                        </button>

                        <button
                          onClick={() => handleVote('down')}
                          disabled={ratingLoading}
                          aria-pressed={ratingStatus === 'down'}
                          title={ratingStatus === 'down' ? 'Remove downvote' : 'Downvote'}
                          style={{
                            padding: '6px 10px',
                            backgroundColor: ratingStatus === 'down' ? '#7f1d1d' : '#fff1f2',
                            color: ratingStatus === 'down' ? '#fff' : '#7f1d1d',
                            border: '1px solid #fecaca',
                            borderRadius: 6,
                            cursor: ratingLoading ? 'default' : 'pointer'
                          }}
                        >
                          {ratingLoading ? <CircularProgress size={18} color={ratingStatus === 'down' ? '#fff' : '#7f1d1d'} /> : (ratingStatus === 'down') ? "▼ Downvoted": '▼ Downvote'}
                        </button>
                      </div>
                    )}

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
                                {refTitles? refTitles[index] : " "}
                            </h6>
                        </li> ) : " "}
                    </ul>
                </div>
                </div>
            )}
        </div>
    );
}
