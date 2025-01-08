import React, { useEffect, useState, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline, CircularProgress, Box } from '@mui/material';
import theme from './theme';
import Layout from './components/Layout';
import Login from './components/Auth/Login';
import Logout from './components/Auth/Logout';
import Home from './components/Home';
import PrivateRoute from './components/PrivateRoute';
import Register from './components/Auth/Register';
import ScanQR from './components/Game/ScanQR';
import Challenge from './components/Game/Challenge';
import Leaderboard from './components/Leaderboard';
import api from './api';
import { jwtDecode } from 'jwt-decode';

function App() {
    const [userName, setUserName] = useState('');
    const [userPoints, setUserPoints] = useState(0);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const isTokenExpired = (token) => {
        try {
            const decoded = jwtDecode(token);
            const currentTime = Date.now() / 1000;
            return decoded.exp < currentTime;
        } catch (error) {
            return true;
        }
    };

    const fetchUserData = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('access_token');

            if (!token || isTokenExpired(token)) {
                setIsAuthenticated(false);
                return;
            }

            const response = await api.get('/user-data');
            setUserName(response.data.name);
            setUserPoints(response.data.points);
            setIsAuthenticated(true);
        } catch (error) {
            console.error('Error al obtener los datos del usuario:', error);
            setIsAuthenticated(false);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUserData();
    }, [fetchUserData]);

    const handleAuthChange = () => {
        fetchUserData();
    };

    if (loading) {
        return (
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
                    <CircularProgress />
                </Box>
            </ThemeProvider>
        );
    }

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Router>
                <Layout userName={userName} userPoints={userPoints}>
                    <Routes>
                        <Route path="/login" element={<Login onAuthChange={handleAuthChange} />} />
                        <Route path="/logout" element={<Logout onAuthChange={handleAuthChange} />} />
                        <Route path="/register" element={<Register onAuthChange={handleAuthChange} />} />

                        {/* Private Routes */}
                        <Route
                            path="/home"
                            element={isAuthenticated ? <Home /> : <Navigate to="/login" />}
                        />
                        <Route
                            path="/scan-qr"
                            element={isAuthenticated ? <ScanQR /> : <Navigate to="/login" />}
                        />
                        <Route
                            path="/challenge/:token"
                            element={isAuthenticated ? <Challenge /> : <Navigate to="/login" />}
                        />
                        <Route
                            path="/leaderboard"
                            element={isAuthenticated ? <Leaderboard /> : <Navigate to="/login" />}
                        />
                        <Route path="*" element={<Navigate to="/login" />} />
                    </Routes>
                </Layout>
            </Router>
        </ThemeProvider>
    );
}

export default App;
