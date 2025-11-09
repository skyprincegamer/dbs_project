import React, { useContext, useState } from 'react';
import { Navigate, Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthProvider';
import NavTab from '../components/NavTab';
import { Menu } from 'lucide-react';
import '../styles/style.css';

const ProtectedRoute = ({ component: Component, navbarAdditionContent }) => {
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };


  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      {/* Navigation Bar */}
      <nav style={{
        backgroundColor: 'white',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        padding: '0.75rem 1rem',
        position: 'sticky',
        top: 0,
        zIndex: 1000
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          {/* Logo/Brand */}
          <div style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: '#2563eb'
          }}>
            PaperPedia
          </div>

           {/* Navigation Links - Desktop */}
              <div className="nav-links-desktop" style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
              <NavTab to="/search" text="Search By Title" />
              <NavTab to="/searchtags" text="Search By Tags" />
              <NavTab to="/add-article" text="Add an Article" />

            {/* User Profile Section */}
             <div style={{
               display: 'flex',
               alignItems: 'center',
               gap: '1rem',
               paddingLeft: '1rem',
               borderLeft: '1px solid #e5e7eb'
             }}>
            {/* User Avatar & Name */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <img
               src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.user?.username || 'User')}`}
               alt={user?.user?.username || 'User'}
               style={{
               width: '32px',
               height: '32px',
               borderRadius: '50%',
               objectFit: 'cover',
               border: '2px solid #e5e7eb'
              }}
              />
              <span style={{
               fontSize: '0.875rem',
               fontWeight: '500',
               color: '#374151'
              }}>
              {user?.user?.username || 'User'}
            </span>
            </div>

            {/* Logout Button */}
            <button
            onClick={logout}
            style={{
            backgroundColor: '#fee2e2',
            color: '#b91c1c',
            border: '1px solid #fecaca',
            padding: '0.5rem 1rem',
            borderRadius: '0.375rem',
            fontSize: '0.875rem',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
             e.target.style.backgroundColor = '#fecaca';
             e.target.style.borderColor = '#fca5a5';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#fee2e2';
              e.target.style.borderColor = '#fecaca';
            }}
            >
           Logout
          </button>
       </div>
      </div>

          {/* Mobile Menu Button */}
          <button 
            className="mobile-menu-button"
            style={{
              display: 'none',
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#2563eb'
            }}
            onClick={toggleMobileMenu}
          >
            <Menu />
          </button>
        </div>

        {/* Mobile Menu */}
        <div 
          className={`nav-links-mobile ${isMobileMenuOpen ? '' : 'hidden'}`}
          style={{
            display: 'none',
            flexDirection: 'column',
            gap: '1rem',
            padding: '1rem',
            backgroundColor: 'white',
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            borderTop: '1px solid #e5e7eb',
            transition: 'ease-in-out 0.8s',
            boxShadow: '2px 2px 10px rgba(0, 0, 0, 0.1)'
          }}
        >
          <NavTab to="/dashboard" text="Dashboard" />
          <NavTab to="/match" text="Match Now" />
          <NavTab to="/edit-profile" text="Edit Profile" />
          <NavTab to="/chat" text="Previous Chats" />
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            paddingTop: '1rem',
            borderTop: '1px solid #e5e7eb'
          }}>
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.user?.username || 'User')}`}
              alt={user?.user?.username || 'User'}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid #e5e7eb'
              }}
            />
            <span style={{
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#374151'
            }}>
              {user?.user?.username || 'User'}
            </span>
            
            <button
              onClick={logout}
              style={{
                backgroundColor: '#fee2e2',
                color: '#b91c1c',
                border: '1px solid #fecaca',
                padding: '0.5rem 1rem',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#fecaca';
                e.target.style.borderColor = '#fca5a5';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#fee2e2';
                e.target.style.borderColor = '#fecaca';
              }}
            >
              Logout
            </button>
          </div>
        </div>

        {/* Extra Possible Content */}
        { !(!navbarAdditionContent) && navbarAdditionContent }
      </nav>


      {/* Page Content */}
      <div>
        <Component />
      </div>
    </div>
  );
};

export default ProtectedRoute;

