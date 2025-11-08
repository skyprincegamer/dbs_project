import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import CircularProgress from '../components/CircularProgress';

export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const fetchUser = async () => {
    console.log(localStorage.getItem('token'));
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${backendUrl}/verify-user`, {
        method: 'POST',
        credentials: 'include',
        accessControlAllowCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token: localStorage.getItem('token')
        })
      });
      if (!res.ok) throw new Error('Not authenticated');
      const data = await res.json();
      if (data.user) {
        setUser(data);
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
      setError('Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await fetch(`${backendUrl}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });
      const resData = await res.json();
      if (res.status !== 200) {
        setError(resData.message || 'Incorrect email or password');
        throw new Error(resData.message || 'Incorrect email or password');
      } else {
        setUser(resData);
        let date = new Date();
        date.setTime(date.getTime() + (30 * 24 * 60 * 60 * 1000));
        const expires = "expires=" + date.toUTCString();
        document.cookie = `paperpedia=${resData.token}; path=/*; SameSite=None; Secure; ${expires};`;
        localStorage.setItem('token', resData.token);
        setError('');
      }
    } catch (err) {
      setError('Login failed');
      throw err;
    }
    if (user) navigate('/match');
  };

  const logout = async () => {
    // try {
    //   await fetch(`${backendUrl}/logout`, { method: 'POST', credentials: 'include' });
    // } catch {}
    document.cookie = 'paperpedia=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    localStorage.clear();
    setUser(null);
    navigate('/login');
  };

  const register = async (username, email, password) => {
  // setError('');
  try {
    const res = await fetch(`${backendUrl}/create-account`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
      credentials: 'include',
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Account creation failed');
    }
    return data;
  } catch (err) {
    setError(err.message || 'Account creation failed');
    throw err;
  }
};

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    error,
    login,
    logout,
    fetchUser,
    register
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? <div style={{marginTop: '20%'}}><CircularProgress /></div> : children}
    </AuthContext.Provider>
  );
};