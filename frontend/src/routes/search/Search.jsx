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
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/search/person`, {
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
        <button style={{ height: '35px', width: '40px', background: 'transparent', border: 'none', borderRadius: '5px', color: 'white' }} onClick={() => navigate(-1)}>&larr;</button>
        <h1 style={{marginLeft: '1rem', color: 'white'}}>Search People</h1>
      </nav>
      <input
        type="text"
        placeholder="Search by Name"
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
        searchResults.map((person) => (
          <div
            key={person._id}
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
              <a href={`/profile/${person._id}`} >
              <img
                src={person.profilePicUrl || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(person.username)}
                alt={person.username}
                style={{ width: '50px', height: '50px', borderRadius: '50%', marginRight: '10px' }}
              />
              </a>
              <a href={`/profile/${person._id}`} style={{ marginRight: '10px', color: 'black', textDecoration: 'none' }}>
                <b>{person.username}</b>
              </a>
            </div>
            <div style={{flex: 1}}>
              <a href={`/chat-to-connect/${person._id}`} style={{ textDecoration: 'italic', color: 'white', justifyContent: 'right' }}>
                <button style={{ padding: '5px 10px', backgroundColor: '#007bff', border: 'none', borderRadius: '5px' }}>
                  Chat Now
                </button>
              </a>
            </div>
          </div>
        ))
      ) : (
        <div>No people found</div>
      )}
    </div>
  );
};

export default Search;
