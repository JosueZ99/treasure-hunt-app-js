import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, TextField, Typography, Paper, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const Register = ({ onAuthChange }) => {
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [password, setPassword] = useState('');
    const [formErrors, setFormErrors] = useState({});
    const [backendError, setBackendError] = useState('');
    const navigate = useNavigate();
    const backendUrl = process.env.REACT_APP_API_URL;  // Corregido el nombre de la variable

    const validateForm = () => {
        let errors = {};

        if (!firstName.trim()) {
            errors.firstName = "El nombre es obligatorio.";
        }
        if (!lastName.trim()) {
            errors.lastName = "El apellido es obligatorio.";
        }
        if (!email) {
            errors.email = "El correo electrónico es obligatorio.";
        } else if (!/^[A-Z0-9._%+-]+@puce\.edu\.ec$/i.test(email)) {
            errors.email = "El correo debe pertenecer al dominio @puce.edu.ec.";
        }
        if (password.length < 6) {
            errors.password = "La contraseña debe tener al menos 6 caracteres.";
        }

        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        const formErrors = validateForm();
        if (Object.keys(formErrors).length > 0) {
            setFormErrors(formErrors);
            return;
        }
    
        try {
            const response = await fetch(`${backendUrl}/register`, { 
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    first_name: firstName,
                    last_name: lastName,
                    email,
                    password,
                }),
            });
    
            const data = await response.json();
    
            if (response.ok) {
                localStorage.setItem('access_token', data.access_token);  // Corregido el nombre de la clave del token
                localStorage.setItem('refresh_token', data.refresh_token); 
                onAuthChange(); 
                navigate('/home');
            } else {
                setBackendError(data.error || 'Hubo un error al registrar la cuenta.');
            }
        } catch (err) {
            setBackendError('Hubo un error al conectar con el servidor.');
        }
    };    

    const handleGoBack = () => {
        navigate('/login');
    };

    return (
        <Box 
            sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                flex: '1 0 auto',
                alignItems: 'center', 
                justifyContent: 'center', 
                px: 2, 
                py: 4, 
                bgcolor: 'background.default' 
            }}
        >
            <Paper 
                elevation={3} 
                sx={{ 
                    p: 4, 
                    maxWidth: 400, 
                    width: '100%', 
                    textAlign: 'center', 
                    bgcolor: 'background.paper', 
                    color: 'text.primary' 
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, position: 'relative' }}>
                    <IconButton 
                        onClick={handleGoBack} 
                        sx={{ position: 'absolute', left: 0 }}
                    >
                        <ArrowBackIcon />
                    </IconButton>
                    <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h5" sx={{ textAlign: 'center' }}>
                            Registro de cuenta
                        </Typography>
                    </Box>
                </Box>

                <form onSubmit={handleSubmit} noValidate>
                    <TextField
                        fullWidth
                        label="Correo electrónico"
                        variant="outlined"
                        margin="dense"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        error={Boolean(formErrors.email)}
                        helperText={formErrors.email}
                    />

                    <TextField
                        fullWidth
                        label="Nombre"
                        variant="outlined"
                        margin="dense"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        error={Boolean(formErrors.firstName)}
                        helperText={formErrors.firstName}
                    />

                    <TextField
                        fullWidth
                        label="Apellido"
                        variant="outlined"
                        margin="dense"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        error={Boolean(formErrors.lastName)}
                        helperText={formErrors.lastName}
                    />

                    <TextField
                        fullWidth
                        label="Contraseña"
                        type="password"
                        variant="outlined"
                        margin="dense"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        error={Boolean(formErrors.password)}
                        helperText={formErrors.password}
                    />

                    {backendError && (
                        <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                            {backendError}
                        </Typography>
                    )}

                    <Button 
                        type="submit" 
                        variant="contained" 
                        color="primary" 
                        fullWidth 
                        sx={{ mt: 2 }}
                    >
                        Registrar
                    </Button>
                </form>
            </Paper>
        </Box>
    );
};

export default Register;
