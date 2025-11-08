import React from 'react';

const NotFoundPage = () => {
  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      textAlign: 'center',
      padding: '20px',
      backgroundColor: '#f8f9fa',
      fontFamily: 'Arial, sans-serif'
    },
    errorCode: {
      fontSize: '120px',
      fontWeight: 'bold',
      color: '#343a40',
      margin: '0',
      lineHeight: '1'
    },
    errorMessage: {
      fontSize: '24px',
      color: '#6c757d',
      margin: '20px 0'
    },
    description: {
      fontSize: '16px',
      color: '#6c757d',
      maxWidth: '500px',
      marginBottom: '30px'
    },
    homeButton: {
      padding: '12px 24px',
      backgroundColor: '#007bff',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      fontSize: '16px',
      cursor: 'pointer',
      transition: 'background-color 0.3s'
    },
    homeButtonHover: {
      backgroundColor: '#0069d9'
    }
  };

  const [isHovered, setIsHovered] = React.useState(false);

  const handleGoDashboard = () => {
    // This would typically navigate to your home page
    // For a real app, you might use React Router's history.push('/')
    window.location.href = '/dashboard';
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.errorCode}>404</h1>
      <h2 style={styles.errorMessage}>Page Not Found</h2>
      <p style={styles.description}>
        The page you are looking for might have been removed, had its name changed, 
        or is temporarily unavailable.
      </p>
      <button 
        style={{...styles.homeButton, ...(isHovered ? styles.homeButtonHover : {})}}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleGoDashboard}
      >
        Go to Homepage
      </button>
    </div>
  );
};

export default NotFoundPage;