import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { refreshAccessToken } from '../tokenUtils';

const isTokenExpired = (token) => {
    try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        return decoded.exp < currentTime;
    } catch (error) {
        return true; // If token fails to decode, treat it as expired
    }
};

const PrivateRoute = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const checkToken = async () => {
            const token = localStorage.getItem('access_token');

            if (!token || isTokenExpired(token)) {
                try {
                    // Attempt to refresh the token
                    const newToken = await refreshAccessToken();
                    if (newToken) {
                        setIsAuthenticated(true);
                    } else {
                        navigate('/login');
                    }
                } catch (error) {
                    console.error("Error refreshing token:", error);
                    navigate('/login');
                }
            } else {
                setIsAuthenticated(true);
            }
            setLoading(false);
        };

        checkToken();
    }, [navigate]);

    if (loading) {
        return <div>Loading...</div>; // Prevent rendering children until token check completes
    }

    return isAuthenticated ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
