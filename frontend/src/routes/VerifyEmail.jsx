import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

const VerifyEmail = () => {
  const { uuid } = useParams();
  const [verification, setVerification] = useState(null);

  useEffect(() => {
    const verifyAccount = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/verify-account/${uuid}`, {
          method: 'POST'
        });
        if (!res.ok) {
          setVerification(false);
        } else {
          setVerification(true);
        }
      } catch (err) {
        setVerification(false);
      }
    };

    verifyAccount();
  }, [uuid]);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f3f4f6',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '0.75rem',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        padding: '3rem',
        textAlign: 'center',
        maxWidth: '500px',
        width: '100%'
      }}>
        {verification === null ? (
          <div>
            <div style={{
              width: '64px',
              height: '64px',
              border: '4px solid #e5e7eb',
              borderTop: '4px solid #2563eb',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 2rem'
            }} />
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem' }}>
              Verifying...
            </h1>
            <p style={{ color: '#6b7280' }}>
              Please wait while we verify your account.
            </p>
          </div>
        ) : verification ? (
          <div>
            <div style={{
              width: '64px',
              height: '64px',
              backgroundColor: '#10b981',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 2rem',
              color: 'white',
              fontSize: '2rem'
            }}>
              ✓
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981', marginBottom: '1rem' }}>
              Verification Successful!
            </h2>
            <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
              Your account has been successfully verified. You can now log in to PaperPedia.
            </p>
            <Link 
              to="/login"
              style={{
                backgroundColor: '#2563eb',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                textDecoration: 'none',
                fontWeight: '500',
                display: 'inline-block'
              }}
            >
              Go to Login
            </Link>
          </div>
        ) : (
          <div>
            <div style={{
              width: '64px',
              height: '64px',
              backgroundColor: '#dc2626',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 2rem',
              color: 'white',
              fontSize: '2rem'
            }}>
              ✗
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#dc2626', marginBottom: '1rem' }}>
              Verification Failed
            </h2>
            <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
              The verification link is invalid or has expired. Please try creating your account again.
            </p>
            <Link 
              to="/create-account"
              style={{
                backgroundColor: '#2563eb',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                textDecoration: 'none',
                fontWeight: '500',
                display: 'inline-block'
              }}
            >
              Create Account
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;