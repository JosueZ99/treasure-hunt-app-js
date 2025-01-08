import React, { useEffect, useState } from 'react';
import QrScanner from 'react-qr-scanner';
import { Box, Typography, Fab, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const ScanQR = () => {
    const navigate = useNavigate();
    const [isCameraAvailable, setIsCameraAvailable] = useState(false);
    const [isScanning, setIsScanning] = useState(false); // Prevent repeated scans
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
            setIsScanning(true);  // Prevent multiple requests
            try {
                const token = localStorage.getItem('access_token');
                if (!token) throw new Error("No hay token disponible.");
    
                // ✅ Ensure the scanned QR data is a string
                const qrCodeValue = typeof data === 'string' ? data : data.text;
                
                console.log("QR Code Sent:", qrCodeValue);  // <-- Added for debugging
    
                const response = await axios.post(
                    `${backendUrl}/api/scan-qr`, 
                    { qr_code: qrCodeValue }, 
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    }
                );
    
                if (response.status === 200) {
                    const token = response.data.token;
                    navigate(`/challenge/${token}`);
                } else {
                    alert('Error al procesar el QR. Inténtalo de nuevo.');
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
