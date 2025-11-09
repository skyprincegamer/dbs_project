import React, { useState, useEffect } from 'react';
import CircularProgress from '../../components/CircularProgress';
import { useNavigate } from 'react-router-dom';

const Search = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate()

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (searchTerm.trim() === '') {
        setSearchResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/search/article`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({ query: searchTerm, token: localStorage.getItem('token') })
        });
        const data = await response.json();
        setSearchResults(data);
      } catch (error) {
        console.error('Error fetching search results:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSearchResults();
  }, [searchTerm]);

  return (
    <div style={{ padding: '20px', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <nav style={{display: 'flex', marginBottom: '20px', alignItems: 'center', backgroundColor: '#1427d0ff', padding: '3px 10px', borderRadius: '5px'}}>
        <h1 style={{marginLeft: '1rem', color: 'white'}}>Search By Title</h1>
      </nav>
      <input
        type="text"
        placeholder="Search by Title..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{
          padding: '10px',
          fontSize: '16px',
          width: '100%',
          boxSizing: 'border-box',
          marginBottom: '20px',
          border: '2px solid blue'
        }}
      />
      {isLoading ? (
        <CircularProgress />
      ) : searchResults.length > 0 ? (
        searchResults.map((article) => (
          <div
            key={article.article_id}
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '10px',
              padding: '10px',
              border: '1px solid #ccc',
              borderRadius: '5px'
            }}
          >
            <div style={{display: 'flex', flex: 4, flexDirection: 'row', alignContent: 'center', alignItems: 'center'}}>
              <a href={`/article/${article.article_id}`} style={{ marginRight: '10px', color: 'black', textDecoration: 'none' }}>
                {article.title}
              </a>
            </div>
            <div style={{flex: 1}}>
              <b>By:</b> {article.username}
            </div>
          </div>
        ))
      ) : (
        <div>No articles found</div>
      )}
    </div>
  );
};

export default Search;
