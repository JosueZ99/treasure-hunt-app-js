import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, AppBar, Toolbar, Typography, Container, IconButton, Menu, MenuItem } from '@mui/material';
import AccountCircle from '@mui/icons-material/AccountCircle';

const Layout = ({ children, userName = "Usuario", userPoints = 0 }) => {
    const location = useLocation(); 
    const navigate = useNavigate(); 
    const hideNavbar = location.pathname === '/login' || location.pathname === '/register'; 

    const [anchorEl, setAnchorEl] = useState(null);

    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    // Cambiado logout para navegar correctamente
    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        handleClose();
        navigate('/login'); // Redirigiendo usando React Router en lugar de window.href
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            {/* Barra de navegación */}
            {!hideNavbar && (
                <AppBar position="sticky" color="primary">
                    <Toolbar sx={{ justifyContent: 'space-between', gap: 2 }}>
                        {/* Menú de usuario */}
                        <Box>
                            <IconButton
                                edge="start"
                                color="inherit"
                                aria-label="menú de usuario"
                                onClick={handleMenu}
                                sx={{ p: 0, ml: 0.1 }}
                            >
                                <AccountCircle sx={{ mr: 1 }} />
                                <Typography variant="h6" component="div">
                                    {userName}
                                </Typography>
                            </IconButton>
                            <Menu
                                anchorEl={anchorEl}
                                open={Boolean(anchorEl)}
                                onClose={handleClose}
                                anchorOrigin={{
                                    vertical: 'top',
                                    horizontal: 'left',
                                }}
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'left',
                                }}
                            >
                                <MenuItem onClick={handleLogout}>Cerrar Sesión</MenuItem>
                            </Menu>
                        </Box>

                        {/* Puntos del usuario */}
                        <Typography variant="h6" component="div">
                            {`${userPoints} pts`}
                        </Typography>
                    </Toolbar>
                </AppBar>
            )}

            {/* Sección de contenido principal */}
            <Box
                component="main"
                sx={{
                    flex: '1 0 auto',
                    bgcolor: 'background.default',
                    color: 'text.primary',
                    py: 3,
                }}
            >
                <Container>{children}</Container>
            </Box>

            {/* Sección de pie de página */}
            <Box
                component="footer"
                sx={{
                    bgcolor: 'background.paper',
                    py: 2,
                    textAlign: 'center',
                    mt: 'auto',
                }}
            >
                <Typography variant="body2">
                    © 2024 EcoTreasure Hunt. Todos los derechos reservados.
                </Typography>
            </Box>
        </Box>
    );
};

export default Layout;
