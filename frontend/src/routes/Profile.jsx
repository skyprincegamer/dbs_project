import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';
import CircularProgress from '../components/CircularProgress';
import { BookOpen, Star, Languages, Mail, Calendar, MapPin, X } from 'lucide-react';

const Profile = () => {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [ratingLoading, setRatingLoading] = useState(false);
  const [personalityRating, setPersonalityRating] = useState('');
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [subjectRatings, setSubjectRatings] = useState({});
  
  const isOwnProfile = currentUser?.user?._id === id;

  useEffect(() => {
    fetchUserProfile();
  }, [id]);

  const handlePersonalityRating = async (rating) => {
    if(rating<0 || rating>10) return;
    try {
      setRatingLoading(true);
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/rating_routes/personality`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: profileUser._id,
          rating: rating,
          token: localStorage.getItem('token')
        })
      });

      if (response.ok) {
        window.location.reload();
      } else {
        throw new Error('Failed to update rating');
      }
    } catch (error) {
      alert('Rating update failed');
      console.error('Error updating rating:', error);
    } finally {
      setRatingLoading(false);
    }
  };

  const handleTakeBackPersonalityRating = async () => {
    try {
      setRatingLoading(true);
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/rating_routes/take_back/personality`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: profileUser._id,
          token: localStorage.getItem('token')
        })
      });

      if (response.ok) {
        window.location.reload();
      } else {
        throw new Error('Failed to take back rating');
      }
    } catch (error) {
      alert('Failed to take back rating');
      console.error('Error taking back rating:', error);
    } finally {
      setRatingLoading(false);
    }
  };

  const handleSubjectRating = async (subjectName, rating) => {
    if(rating<0 || rating>10) return;
    try {
      setRatingLoading(true);
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/rating_routes/subject`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: profileUser._id,
          subjectName: subjectName,
          rating: rating,
          token: localStorage.getItem('token')
        })
      });

      if (response.ok) {
        window.location.reload();
      } else {
        throw new Error('Failed to update subject rating');
      }
    } catch (error) {
      alert('Subject rating update failed');
      console.error('Error updating subject rating:', error);
    } finally {
      setRatingLoading(false);
    }
  };

  const handleTakeBackSubjectRating = async (subjectName) => {
    try {
      setRatingLoading(true);
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/rating_routes/take_back/subject`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: profileUser._id,
          subjectName: subjectName,
          token: localStorage.getItem('token')
        })
      });

      if (response.ok) {
        window.location.reload();
      } else {
        throw new Error('Failed to take back subject rating');
      }
    } catch (error) {
      alert('Failed to take back subject rating');
      console.error('Error taking back subject rating:', error);
    } finally {
      setRatingLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/search/user/${id}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: localStorage.getItem('token')
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }

      const data = await response.json();
      setProfileUser(data.user || data);
    } catch (err) {
      setError(err.message || 'Error loading profile');
    } finally {
      setLoading(false);
    }
  };

  const renderPersonalityRating = (rating) => {
    if (!rating || rating.totalRatings === 0) {
      return "No ratings yet";
    }
    return (rating.average / rating.totalRatings)?.toFixed(2);
  };

  const renderSubjectRating = (subject) => {
    if (subject.totalReceivedRatings < 10) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <Star size={14} color="#047857" />
          <span style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>
            {subject.selfRating?.toFixed(2)} (self)
          </span>
        </div>
      );
    } else {
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <Star size={14} color="#3b82f6" />
          <span style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>
            {(subject.totalReceivedRatings / subject.noOfRatings)?.toFixed(2)} ({subject.noOfRatings} reviews)
          </span>
        </div>
      );
    }
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#f3f4f6',
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center' 
      }}>
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#f3f4f6',
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div style={{ 
          backgroundColor: '#fee2e2', 
          color: '#b91c1c', 
          padding: '1rem 2rem', 
          borderRadius: '0.5rem',
          textAlign: 'center'
        }}>
          {error}
        </div>
        <button 
          onClick={() => navigate(-1)}
          style={{
            backgroundColor: '#2563eb',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '0.375rem',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '2rem 0' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 1rem' }}>
        
        {/* Header Section */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '0.75rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          padding: '2rem',
          marginBottom: '2rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
            {/* Profile Picture */}
            <img
              src={profileUser?.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(profileUser?.username || 'User')}&size=150`}
              alt={profileUser?.username}
              style={{
                width: '150px',
                height: '150px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '4px solid #e5e7eb'
              }}
            />
            
            {/* Basic Info */}
            <div style={{ flex: 1 }}>
              <h1 style={{ 
                fontSize: '2.25rem', 
                fontWeight: 'bold', 
                color: '#1f2937', 
                marginBottom: '0.5rem' 
              }}>
                {profileUser?.username}
              </h1>
              
              {/* Personality Rating */}
              <div style={{
                backgroundColor: 'white',
                borderRadius: '0.75rem',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                padding: '1.5rem',
                marginBottom: '2rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>Personality Rating</p>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
                      {renderPersonalityRating(profileUser?.personalityRating)}
                    </p>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
                      Rated by: {profileUser?.personalityRating?.totalRatings || 0}
                    </p>
                    {(currentUser && !isOwnProfile) && (
                      <div style={{ marginTop: '1rem' }}>
                        {currentUser.user.peopleIRated?.find(r => r.type === 'personality' && r.to === profileUser._id) ? (
                          <div>
                            <p style={{ fontSize: '0.875rem', color: '#374151', margin: '0.5rem 0' }}>
                              Your Rating: {currentUser.user.peopleIRated.find(r => r.type === 'personality' && r.to === profileUser._id).rating}
                            </p>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                              <input
                                type="number"
                                min="1"
                                max="10"
                                style={{ width: '60px', padding: '0.25rem', border: '1px solid #d1d5db', borderRadius: '0.25rem' }}
                                value={personalityRating}
                                onChange={(e) => setPersonalityRating(e.target.value)}
                              />
                              <button
                                onClick={() => handlePersonalityRating(personalityRating)}
                                style={{
                                  backgroundColor: '#2563eb',
                                  color: 'white',
                                  padding: '0.25rem 0.75rem',
                                  borderRadius: '0.25rem',
                                  border: 'none',
                                  cursor: 'pointer'
                                }}
                              >
                                Save
                              </button>
                              <button
                                onClick={handleTakeBackPersonalityRating}
                                style={{
                                  backgroundColor: '#ef4444',
                                  color: 'white',
                                  padding: '0.25rem 0.75rem',
                                  borderRadius: '0.25rem',
                                  border: 'none',
                                  cursor: 'pointer'
                                }}
                              >
                                Take Back Rating
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <p style={{ fontSize: '0.875rem', color: '#374151', margin: '0.5rem 0' }}>
                              You haven't rated yet.
                            </p>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                              <input
                                type="number"
                                min="1"
                                max="10"
                                style={{ width: '60px', padding: '0.25rem', border: '1px solid #d1d5db', borderRadius: '0.25rem' }}
                                value={personalityRating}
                                onChange={(e) => setPersonalityRating(e.target.value)}
                              />
                              <button
                                onClick={() => handlePersonalityRating(personalityRating)}
                                style={{
                                  backgroundColor: '#2563eb',
                                  color: 'white',
                                  padding: '0.25rem 0.75rem',
                                  borderRadius: '0.25rem',
                                  border: 'none',
                                  cursor: 'pointer'
                                }}
                              >
                                Rate Now
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <Star size={32} color="#f59e0b" />
                </div>
                {ratingLoading && <CircularProgress />}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                {isOwnProfile ? (
                  <Link to="/edit-profile">
                    <button style={{
                      backgroundColor: '#2563eb',
                      color: 'white',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '0.5rem',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: '500',
                      textDecoration: 'none'
                    }}>
                      Edit Profile
                    </button>
                  </Link>
                ) : (
                  <button 
                    onClick={() => navigate(`/chat-to-connect/${profileUser._id}`)}
                    style={{
                      backgroundColor: '#10b981',
                      color: 'white',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '0.5rem',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: '500'
                    }}
                  >
                    Start Chat
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          
          {/* Languages Section */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '0.75rem',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            padding: '1.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
              <Languages size={24} color="#6366f1" />
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#374151', marginLeft: '0.5rem' }}>
                Languages
              </h2>
            </div>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {profileUser?.languages && profileUser.languages.length > 0 ? (
                profileUser.languages.map((language, index) => (
                  <span
                    key={index}
                    style={{
                      backgroundColor: '#e0e7ff',
                      color: '#4338ca',
                      padding: '0.5rem 1rem',
                      borderRadius: '9999px',
                      fontSize: '0.875rem',
                      fontWeight: '500'
                    }}
                  >
                    {language}
                  </span>
                ))
              ) : (
                <span style={{ color: '#6b7280', fontStyle: 'italic' }}>
                  No languages listed
                </span>
              )}
            </div>
          </div>

          {/* Teaching Subjects Section */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '0.75rem',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            padding: '1.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
              <BookOpen size={24} color="#10b981" />
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#374151', marginLeft: '0.5rem' }}>
                Teaching Subjects
              </h2>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {profileUser?.teachingSubjects && profileUser.teachingSubjects.length > 0 ? (
                profileUser.teachingSubjects.map((subject, index) => subject.active && (
                  <div
                    key={index}
                    style={{
                      backgroundColor: '#f0fdf4',
                      border: '1px solid #d1fae5',
                      borderRadius: '0.5rem',
                      padding: '1rem'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#047857', margin: 0 }}>
                        {subject.subjectName}
                      </h3>
                      <div>
                        {renderSubjectRating(subject)}
                        {currentUser && 
                          <button
                            onClick={() => {
                              setSelectedSubject(subject);
                              setShowModal(true);
                            }}
                            style={{
                              backgroundColor: '#047857',
                              color: 'white',
                              padding: '0.25rem 0.75rem',
                              borderRadius: '0.25rem',
                              border: 'none',
                              cursor: 'pointer',
                              marginLeft: '0.5rem',
                              transition: 'background-color 0.2s',
                              marginTop: '0.7rem'
                            }}
                          >
                            Rate
                          </button>
                      }
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <span style={{ color: '#6b7280', fontStyle: 'italic' }}>
                  No teaching subjects listed
                </span>
              )}
            </div>
          </div>


          {/* Learning Subjects Section */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '0.75rem',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            padding: '1.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
              <BookOpen size={24} color="#8b5cf6" />
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#374151', marginLeft: '0.5rem' }}>
                Learning Subjects
              </h2>
            </div>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {profileUser?.learningSubjects && profileUser.learningSubjects.length > 0 ? (
                profileUser.learningSubjects.map((subject, index) => (
                  <span
                    key={index}
                    style={{
                      backgroundColor: '#ede9fe',
                      color: '#6d28d9',
                      padding: '0.5rem 1rem',
                      borderRadius: '9999px',
                      fontSize: '0.875rem',
                      fontWeight: '500'
                    }}
                  >
                    {subject}
                  </span>
                ))
              ) : (
                <span style={{ color: '#6b7280', fontStyle: 'italic' }}>
                  No learning subjects listed
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Modal for subjects */}
          {showModal && selectedSubject && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 1000
            }}>
              <div style={{
                backgroundColor: 'white',
                borderRadius: '0.75rem',
                padding: '2rem',
                maxWidth: '500px',
                width: '90%',
                position: 'relative'
              }}>
                <button
                  onClick={() => setShowModal(false)}
                  style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0.5rem'
                  }}
                >
                  <X color='black' size={24} />
                </button>
                
                <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1f2937', marginBottom: '1.5rem' }}>
                  {selectedSubject.subjectName}
                </h2>
                
                <div style={{ marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                    Self Rating
                  </h3>
                  <p style={{ fontSize: '1.25rem', fontWeight: '600', color: '#2563eb' }}>
                    {selectedSubject.selfRating || 'Not rated'}
                  </p>
                </div>
                
                <div style={{ marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                    Community Rating
                  </h3>
                  <p style={{ fontSize: '1.25rem', fontWeight: '600', color: '#2563eb' }}>
                    {selectedSubject.noOfRatings > 0 
                      ? (selectedSubject.totalReceivedRatings / selectedSubject.noOfRatings)?.toFixed(2)
                      : 'Not rated'}
                  </p>
                </div>
                {(currentUser && !isOwnProfile) && (
                  <div style={{ marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                      Your Rating
                    </h3>
                    {currentUser && currentUser.user.peopleIRated && currentUser.user.peopleIRated.find(r => 
                      r.type === 'subject' && 
                      r.subjectName === selectedSubject.subjectName && 
                      r.to === profileUser._id
                    ) ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <p style={{ fontSize: '1rem', color: '#374151' }}>
                          Your current rating: {currentUser.user.peopleIRated.find(r => 
                            r.type === 'subject' && 
                            r.subjectName === selectedSubject.subjectName && 
                            r.to === profileUser._id
                          ).rating}
                        </p>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <input
                            type="number"
                            min="1"
                            max="10"
                            style={{ width: '60px', padding: '0.25rem', border: '1px solid #d1d5db', borderRadius: '0.25rem' }}
                            value={subjectRatings[selectedSubject.subjectName] || ''}
                            onChange={(e) => setSubjectRatings({
                              ...subjectRatings,
                              [selectedSubject.subjectName]: e.target.value
                            })}
                          />
                          <button
                            onClick={() => handleSubjectRating(selectedSubject.subjectName, subjectRatings[selectedSubject.subjectName])}
                            style={{
                              backgroundColor: '#2563eb',
                              color: 'white',
                              padding: '0.25rem 0.75rem',
                              borderRadius: '0.25rem',
                              border: 'none',
                              cursor: 'pointer'
                            }}
                          >
                            Save
                          </button>
                          <button
                            onClick={() => handleTakeBackSubjectRating(selectedSubject.subjectName)}
                            style={{
                              backgroundColor: '#ef4444',
                              color: 'white',
                              padding: '0.25rem 0.75rem',
                              borderRadius: '0.25rem',
                              border: 'none',
                              cursor: 'pointer'
                            }}
                          >
                            Take Back
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <p style={{ fontSize: '1rem', color: '#374151' }}>
                          Not rated yet.
                        </p>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <input
                            type="number"
                            min="1"
                            max="10"
                            style={{ width: '60px', padding: '0.25rem', border: '1px solid #d1d5db', borderRadius: '0.25rem' }}
                            value={subjectRatings[selectedSubject.subjectName] || ''}
                            onChange={(e) => setSubjectRatings({
                              ...subjectRatings,
                              [selectedSubject.subjectName]: e.target.value
                            })}
                          />
                          <button
                            onClick={() => handleSubjectRating(selectedSubject.subjectName, subjectRatings[selectedSubject.subjectName])}
                            style={{
                              backgroundColor: '#2563eb',
                              color: 'white',
                              padding: '0.25rem 0.75rem',
                              borderRadius: '0.25rem',
                              border: 'none',
                              cursor: 'pointer'
                            }}
                          >
                            Rate Now
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                    Rated by
                  </h3>
                  <p style={{ fontSize: '1rem', color: '#6b7280' }}>
                    {selectedSubject.noOfRatings || 0} people
                  </p>
                </div>
                
                {ratingLoading && <CircularProgress />}
              </div>
            </div>
          )}

      </div>
    </div>
  );
};

export default Profile;
