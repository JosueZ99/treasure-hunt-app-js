import React, { useEffect, useState } from 'react';
import QrScanner from 'react-qr-scanner';
import { Box, Typography, Fab, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const ScanQR = () => {
    const navigate = useNavigate();
    const [isCameraAvailable, setIsCameraAvailable] = useState(false);
    const [isScanning, setIsScanning] = useState(false); 
    const backendUrl = process.env.REACT_APP_API_URL;

    useEffect(() => {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            setIsCameraAvailable(true);
        } else {
            console.error("El navegador no soporta acceso a la cámara.");
            setIsCameraAvailable(false);
        }
    }, []);

    const handleScan = async (data) => {
        if (data && !isScanning) {
            setIsScanning(true);  
            try {
                const token = localStorage.getItem('access_token');
                if (!token) throw new Error("No token available.");

                // Asegurar la extracción consistente del código QR (solo valor)
                let qrCodeValue = data.text;
                if (qrCodeValue.includes('qr_code=')) {
                    try {
                        qrCodeValue = new URL(qrCodeValue).searchParams.get('qr_code');
                    } catch (error) {
                        console.error("Formato de URL inválido");
                    }
                }

                console.log("Código QR enviado:", qrCodeValue); 

                const response = await fetch(`${backendUrl}/scan-qr`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ qr_code: qrCodeValue })
                });

                const responseData = await response.json();

                if (response.ok) {
                    // Redirigir usando el token QR (responseData.token)
                    console.log("Redirigiendo al desafío con el token QR:", responseData.token);
                    navigate(`/challenge/${responseData.token}`); // Usar el token QR, no el JWT
                } else {
                    alert(responseData.error || 'Error al procesar el QR. Inténtalo de nuevo.');
                }
            } catch (error) {
                console.error('Error al escanear el código QR:', error);
                alert('Error al procesar el QR. Inténtalo de nuevo.');
            } finally {
                setIsScanning(false);
            }
        }
    };

    const handleError = (error) => {
        console.error("Error al acceder a la cámara:", error);
        alert("Error al acceder a la cámara.");
    };

    return (
        <Box sx={{ textAlign: 'center', p: 3 }}>
            <Typography variant="h4">Escanea el Código QR</Typography>
            {isCameraAvailable ? (
                <QrScanner
                    delay={300}
                    style={{ width: '100%' }}
                    onError={handleError}
                    onScan={handleScan}
                />
            ) : (
                <Typography color="error">La cámara no está disponible.</Typography>
            )}
            <Fab
                color="primary"
                onClick={() => navigate('/home')}
                sx={{ position: 'fixed', bottom: 16, right: 16 }}
            >
                <ArrowBackIcon />
            </Fab>
        </Box>
    );
};

export default ScanQR;
