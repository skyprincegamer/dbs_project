import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider';
import Dashboard from './routes/Dashboard';
import Login from './routes/Login';
import CreateAccount from './routes/CreateAccount';
import VerifyEmail from './routes/VerifyEmail';
import ProtectedRoute from './routes/ProtectedRoute';
import Profile from './routes/Profile';
import Search from './routes/search/Search';
import NotFoundPage from './routes/NotFoundPage';

const App = () => {
  return (
      <Router>
    <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/create-account" element={<CreateAccount />} />
          <Route path="/verify-account/:uuid" element={<VerifyEmail />} />
          {/* <Route path="/match" element={<ProtectedRoute component={Match} />} />
          <Route path="/chat" element={<ProtectedRoute component={ListChats} />} />
          <Route path="/chat-to-connect/:uuid" element={<ProtectedRoute component={ConnectChat} navbarAdditionContent={<ChatHeader />} />} /> */}
          <Route path="/dashboard" element={<ProtectedRoute component={Dashboard}/>} />
          {/* <Route path="/edit-profile" element={<ProtectedRoute component={EditProfile} />} /> */}
          {/* <Route path="/forgot-password" /> */}
          {/* <Route path="/change-password/:uuid" /> */}
          <Route path="/search" element={<Search />} />
          <Route path="/profile/:id" element={<Profile />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
    </AuthProvider>
      </Router>
  );
};

export default App;