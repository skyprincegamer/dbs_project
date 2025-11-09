import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider';
// import Dashboard from './routes/Dashboard';
import Login from './routes/Login';
import CreateAccount from './routes/CreateAccount';
import VerifyEmail from './routes/VerifyEmail';
import ProtectedRoute from './routes/ProtectedRoute';
import Profile from './routes/Profile';
import Search from './routes/search/Search';
import NotFoundPage from './routes/NotFoundPage';
import AddArticle from './routes/AddArticle';
import SearchTags from './routes/search/SearchTags';

const App = () => {
  return (
      <Router>
    <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/search" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/create-account" element={<CreateAccount />} />
          <Route path="/verify-account/:uuid" element={<VerifyEmail />} />
          <Route path="/add-article" element={<ProtectedRoute component={AddArticle}/>} />
          {/* <Route path="/dashboard" element={<ProtectedRoute component={Dashboard}/>} /> */}
          <Route path="/search" element={<ProtectedRoute component={Search}/>} />
          <Route path="/searchtags" element={<ProtectedRoute component={SearchTags}/>} />
          <Route path="/profile/:id" element={<Profile />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
    </AuthProvider>
      </Router>
  );
};

export default App;