import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Logout = ({ onAuthChange }) => {
    const navigate = useNavigate();

    useEffect(() => {
        // Clear tokens and update auth state
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');

        if (onAuthChange) {
            onAuthChange();  // Notify the app about auth state change
        }

        // Redirect to login after a short delay
        setTimeout(() => {
            navigate('/login');
        }, 1000); // Adding a small delay for UX
    }, [navigate, onAuthChange]);
    
    return (
        <div style={{ textAlign: 'center', padding: '20px' }}>
            <h2>Cerrando sesión...</h2>
            <p>Serás redirigido a la pantalla de inicio de sesión.</p>
        </div>
    );
};

export default Logout;
