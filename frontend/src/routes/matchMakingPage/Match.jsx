import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthProvider';
import CircularProgress from '../../components/CircularProgress.jsx';
import { BookOpen, Star, Languages } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import FilterSection from '../../components/FilterSection.jsx';

export default function Match() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedSubject, setSelectedSubject] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');


  // Filtering Logic
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [selectedLearningSubjects, setSelectedLearningSubjects] = useState([]);
  const [selectedTeachingSubjects, setSelectedTeachingSubjects] = useState([]);
  const [filterLogic, setFilterLogic] = useState({
    languages: 'AND',
    learningSubjects: 'AND',
    teachingSubjects: 'AND'
  });

    useEffect(() => {
    if (selectedSubject) {
      fetchMatches();
    }
  }, [selectedSubject]);

  useEffect(() => {
    filterCandidates();
  }, [candidates, searchInput, selectedLanguages, selectedLearningSubjects, selectedTeachingSubjects, filterLogic]);

  const filterCandidates = () => {
    let filtered = [...candidates];

    // Username search
    if (searchInput) {
      const searchLower = searchInput.toLowerCase();
      filtered.sort((a, b) => {
        const aMatch = a.username.toLowerCase().includes(searchLower);
        const bMatch = b.username.toLowerCase().includes(searchLower);
        if (aMatch && !bMatch) return -1;
        if (!aMatch && bMatch) return 1;
        return 0;
      });
      filtered = filtered.filter(candidate => 
        candidate.username.toLowerCase().includes(searchLower)
      );
    }

    // Language filter
    if (selectedLanguages.length > 0) {
      filtered = filtered.filter(candidate => {
        if (!candidate.languages) return false;
        const matches = selectedLanguages.every(lang => 
          candidate.languages.includes(lang)
        );
        return filterLogic.languages === 'AND' ? matches :
          selectedLanguages.some(lang => candidate.languages.includes(lang));
      });
    }

    // Learning subjects filter
    if (selectedLearningSubjects.length > 0) {
      filtered = filtered.filter(candidate => {
        if (!candidate.learningSubjects) return false;
        const matches = selectedLearningSubjects.every(subject => 
          candidate.learningSubjects.includes(subject)
        );
        return filterLogic.learningSubjects === 'AND' ? matches :
          selectedLearningSubjects.some(subject => candidate.learningSubjects.includes(subject));
      });
    }

    // Teaching subjects filter
    if (selectedTeachingSubjects.length > 0) {
      filtered = filtered.filter(candidate => {
        if (!candidate.teachingSubjects) return false;
        const matches = selectedTeachingSubjects.every(subject => 
          candidate.teachingSubjects.some(ts => ts.subjectName === subject)
        );
        return filterLogic.teachingSubjects === 'AND' ? matches :
          selectedTeachingSubjects.some(subject => 
            candidate.teachingSubjects.some(ts => ts.subjectName === subject)
          );
      });
    }

    setFilteredCandidates(filtered);
  };

  // An enum of subjects
  const subjects = [
    'Physics', 'Mathematics', 'Chemistry', 'English', 'History',
    'Hindi', 'SST', 'Geography', 'Electrochemistry', 'Biology', 'Astrophysics',
    'Civics', 'Macroeconomics', 'Biochemistry'
  ];

  // Sort subjects to prioritize user's learning subjects
  const sortedSubjects = [...subjects].sort((a, b) => {
    const aIsLearning = user?.learningSubjects?.includes(a);
    const bIsLearning = user?.learningSubjects?.includes(b);
    if (aIsLearning && !bIsLearning) return -1;
    if (!aIsLearning && bIsLearning) return 1;
    return 0;
  });

  useEffect(() => {
    if (selectedSubject) {
      fetchMatches();
    }
  }, [selectedSubject]);

  const fetchMatches = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/matchmaking/match`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wantSubject: selectedSubject,
          mySubjects: user.user.teachingSubjects,
          token: localStorage.getItem('token')
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch matches');
      }

      const data = await response.json();
      setCandidates(data.users || []);
    } catch (err) {
      setError(err.message || 'An error occurred while fetching matches');
    } finally {
      setLoading(false);
    }
  };

  const renderPersonalityRating = (rating) => {
    if (!rating || rating.totalRatings === 0) {
      return "No info yet";
    }
    return (rating.average / rating.totalRatings)?.toFixed(2);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '2rem 0' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '2rem' }}>
          Find Learning Partners
        </h1>
        
        {/* Subject Selector */}
        <div style={{ 
          marginBottom: '2rem', 
          backgroundColor: 'white', 
          borderRadius: '0.5rem', 
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          padding: '1.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
            <BookOpen style={{ marginRight: '0.5rem', color: '#2563eb' }} size={20} />
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#374151' }}>
              Select a subject you want to learn
            </h2>
          </div>
          
          {/* Selector */}
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.5rem',
              outline: 'none',
              transition: 'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
              fontSize: '1rem'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#3b82f6';
              e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#d1d5db';
              e.target.style.boxShadow = 'none';
            }}
          >
            <option value="">Choose a subject</option>
            {sortedSubjects.map((subject) => (
              <option 
                key={subject} 
                value={subject}
                style={{
                  fontWeight: user?.learningSubjects?.includes(subject) ? '600' : 'normal',
                  color: user?.learningSubjects?.includes(subject) ? '#2563eb' : 'inherit'
                }}
              >
                {subject} {user?.learningSubjects?.includes(subject) && '(Your Learning Subject)'}
              </option>
            ))}
          </select>
        </div>

        {/* Search and Filters Section */}
        <div style={{
          display: (loading || !candidates.length) ? 'none' : 'grid',
          marginBottom: '2rem', 
          backgroundColor: 'white', 
          borderRadius: '0.5rem', 
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          padding: '1.5rem'
        }}>
          {/* Search Input */}
          <input
            type="text"
            placeholder="Search by Name..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            style={{
              width: '90%',
              padding: '0.75rem',
              marginBottom: '1rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.5rem',
              outline: 'none',
              fontSize: '1rem'
            }}
          />

          {/* Advanced Filters */}
          <details style={{ marginBottom: '1rem' }}>
            <summary style={{
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '500',
              marginBottom: '1rem',
              color: '#4f46e5'
            }}>
              Advanced Filters
            </summary>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
              <FilterSection
                title="Languages"
                items={Array.from(new Set(candidates.flatMap(c => c.languages || [])))}
                selectedItems={selectedLanguages}
                setSelectedItems={setSelectedLanguages}
                logic={filterLogic.languages}
                onLogicChange={(value) => setFilterLogic(prev => ({ ...prev, languages: value }))}
              />

              <FilterSection
                title="Learning Subjects"
                items={Array.from(new Set(candidates.flatMap(c => c.learningSubjects || [])))}
                selectedItems={selectedLearningSubjects}
                setSelectedItems={setSelectedLearningSubjects}
                logic={filterLogic.learningSubjects}
                onLogicChange={(value) => setFilterLogic(prev => ({ ...prev, learningSubjects: value }))}
              />

              <FilterSection
                title="Teaching Subjects"
                items={Array.from(new Set(candidates.flatMap(c => c.teachingSubjects?.map(ts => ts.subjectName) || [])))}
                selectedItems={selectedTeachingSubjects}
                setSelectedItems={setSelectedTeachingSubjects}
                logic={filterLogic.teachingSubjects}
                onLogicChange={(value) => setFilterLogic(prev => ({ ...prev, teachingSubjects: value }))}
              />
            </div>
          </details>
        </div>

        {/* Loading State */}
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
            <CircularProgress />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div style={{ 
            backgroundColor: '#fee2e2', 
            color: '#b91c1c', 
            padding: '1rem', 
            borderRadius: '0.5rem',
            marginBottom: '1.5rem',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        {/* Candidates List */}
        {!loading && !error && candidates.length > 0 && (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1.5rem'
          }}>
            {filteredCandidates.map((candidate) => (
              <div 
                key={candidate._id} 
                style={{ 
                  backgroundColor: 'white', 
                  borderRadius: '0.5rem', 
                  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
                  overflow: 'hidden',
                  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)';
                }}
              >
                
                <div style={{ paddingLeft: '1.5rem' }}>
                  <Link to={`/profile/${candidate._id}`}>
                    <img
                      src={candidate.profilePic || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(candidate.username)} 
                      alt={candidate.username}
                      style={{ 
                        width: '80px', 
                        height: '80px', 
                        borderRadius: '50%',
                        border: '4px solid white',
                        objectFit: 'cover',
                        marginTop: '1rem'
                      }}
                    />
                  </Link>
                </div>

                {/* User Info */}
                <div style={{ padding: '0rem 1.5rem 1.5rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', marginBottom: '0.25rem' }}>
                    <Link to={`/profile/${candidate._id}`}
                      style={{textDecoration: 'none'}}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.textDecoration = 'underline';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.textDecoration = 'none';
                      }}
                    >
                      {candidate.username}
                    </Link>
                  </h3>

                  {/* Personality Rating */}
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                    <Star style={{ marginRight: '0.25rem', color: '#fbbf24' }} size={16} />
                    <span style={{ fontSize: '0.875rem', color: '#4b5563' }}>
                      Personality Rating: {renderPersonalityRating(candidate.personalityRating)}
                    </span>
                  </div>

                  {/* Languages */}
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <Languages style={{ marginRight: '0.25rem', color: '#6366f1' }} size={16} />
                      <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#4b5563' }}>
                        Languages
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                      {candidate.languages && candidate.languages.length > 0 ? (
                        candidate.languages.map((lang, index) => (
                          <span 
                            key={index}
                            style={{
                              backgroundColor: '#e0e7ff',
                              color: '#4338ca',
                              padding: '0.125rem 0.5rem',
                              borderRadius: '9999px',
                              fontSize: '0.75rem'
                            }}
                          >
                            {lang}
                          </span>
                        ))
                      ) : (
                        <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                          No languages listed
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Teaching Subjects */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <BookOpen style={{ marginRight: '0.25rem', color: '#10b981' }} size={16} />
                      <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#4b5563' }}>
                        Teaching Subjects
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                      {candidate.teachingSubjects && candidate.teachingSubjects.length > 0 ? (
                        candidate.teachingSubjects.map((subject, index) => subject.active && (
                          <span 
                            key={index}
                            style={{
                              backgroundColor: '#d1fae5',
                              color: '#047857',
                              padding: '0.225rem 0.7rem',
                              borderRadius: '9999px',
                              fontSize: '0.75rem'
                            }}
                          >
                            {subject.subjectName}
                            {/* Currently threshold for no of ratings is set to 10 */}
                            {subject.totalReceivedRatings < 10  ? (<>
                              <div style={{marginLeft: '0.3rem'}}>
                                <Star size={11} /> 
                                <b>{(subject.selfRating)?.toFixed(2)}</b>
                              </div>
                            </>) : ( 
                              <div style={{marginLeft: '0.3rem'}}>
                                <Star color='blue' size={11} /> 
                                <b>{(subject.totalReceivedRatings / subject.noOfRatings)?.toFixed(2)}</b>
                              </div>
                          )}
                          </span>
                        ))
                      ) : (
                        <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                          No teaching subjects listed
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Learning Subjects */}
                  <div style={{ marginTop: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <BookOpen style={{ marginRight: '0.25rem', color: '#8b5cf6' }} size={16} />
                      <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#4b5563' }}>
                        Learning Subjects
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                      {candidate.learningSubjects && candidate.learningSubjects.length > 0 ? (
                        candidate.learningSubjects.map((subject, index) => (
                          <span 
                            key={index}
                            style={{
                              backgroundColor: '#ede9fe',
                              color: '#6d28d9',
                              padding: '0.125rem 0.5rem',
                              borderRadius: '9999px',
                              fontSize: '0.75rem'
                            }}
                          >
                            {subject}
                          </span>
                        ))
                      ) : (
                        <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                          No learning subjects listed
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{marginTop: '1rem'}}>
                    <button onClick={() =>{
                      navigate(`/chat-to-connect/${candidate._id}`)
                    }}>Chat Now</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredCandidates.length === 0 && selectedSubject && (
          <div style={{ 
            textAlign: 'center', 
            padding: '3rem',
            backgroundColor: 'white',
            borderRadius: '0.5rem',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem', color: '#9ca3af' }}>👥</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
              No matches found
            </h3>
            <p style={{ color: '#6b7280' }}>
              Try selecting a different combination to find learning partners.
            </p>
          </div>
        )}

        {/* Initial State */}
        {!loading && !error && candidates.length === 0 && !selectedSubject && (
          <div style={{ 
            textAlign: 'center', 
            padding: '3rem',
            backgroundColor: 'white',
            borderRadius: '0.5rem',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem', color: '#9ca3af' }}>📚</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
              Select a subject to find matches
            </h3>
            <p style={{ color: '#6b7280' }}>
              Choose a subject you want to learn to see potential learning partners.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
