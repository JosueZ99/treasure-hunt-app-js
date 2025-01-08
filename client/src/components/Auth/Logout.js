import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Logout = ({ onAuthChange }) => {
    const navigate = useNavigate();

    useEffect(() => {
        // Limpiar tokens y actualizar el estado de autenticación
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');

        if (onAuthChange) {
            onAuthChange();  // Notificar a la aplicación sobre el cambio de estado de autenticación
        }

        // Redirigir a la pantalla de inicio de sesión después de un breve retraso
        setTimeout(() => {
            navigate('/login');
        }, 1000); // Agregar un pequeño retraso para la experiencia del usuario
    }, [navigate, onAuthChange]);
    
    return (
        <div style={{ textAlign: 'center', padding: '20px' }}>
            <h2>Cerrando sesión...</h2>
            <p>Serás redirigido a la pantalla de inicio de sesión.</p>
        </div>
    );
};

export default Logout;
