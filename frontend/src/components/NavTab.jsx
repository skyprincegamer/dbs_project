import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

export default function NavTab({ to, text }) {
  const location = useLocation();
  return (
    <Link 
        to={to} 
        style={{
        textDecoration: 'none',
        color: location.pathname === to ? '#2563eb' : '#374151',
        fontWeight: location.pathname === to ? '600' : '500',
        padding: '0.5rem 1rem',
        borderRadius: '0.375rem',
        backgroundColor: location.pathname === to ? '#dbeafe' : 'transparent',
        transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => {
        if (location.pathname !== to) {
            e.target.style.backgroundColor = '#f3f4f6';
        }
        }}
        onMouseLeave={(e) => {
        if (location.pathname !== to) {
            e.target.style.backgroundColor = 'transparent';
        }
        }}
    >
        {text}
    </Link>
  )
}
