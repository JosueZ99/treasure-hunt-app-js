import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, CircularProgress, RadioGroup, FormControlLabel, Radio, Fab } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const Challenge = () => {
    const { token } = useParams(); 
    const navigate = useNavigate();
    const [challenge, setChallenge] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedAnswer, setSelectedAnswer] = useState('');
    const [isAnswered, setIsAnswered] = useState(false);
    const [feedbackMessage, setFeedbackMessage] = useState('');
    const [earnedPoints, setEarnedPoints] = useState(0);
    const [hint, setHint] = useState(''); 
    const [isHintShown, setIsHintShown] = useState(false);
    const backendUrl = process.env.REACT_APP_API_URL;

    useEffect(() => {
        const fetchChallenge = async () => {
            try {
                const jwtToken = localStorage.getItem('access_token');
                if (!jwtToken) throw new Error("No hay token disponible.");

                const response = await fetch(`${backendUrl}/get_challenge/${token}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${jwtToken}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setChallenge(data);
                } else {
                    alert('No se pudo cargar el desafío.');
                    navigate('/home');
                }
            } catch (error) {
                console.error("Error al cargar el desafío:", error);
                navigate('/home');
            } finally {
                setLoading(false);
            }
        };

        fetchChallenge();
    }, [backendUrl, navigate, token]);

    const handleSolveChallenge = async () => {
        if (!selectedAnswer) {
            alert("Por favor, selecciona una respuesta.");
            return;
        }

        try {
            const response = await fetch(`${backendUrl}/validate_answer/${token}`, { 
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`, 
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ answer: selectedAnswer })
            });

            const data = await response.json();
            setFeedbackMessage(data.message);
            setIsAnswered(true);

            if (data.correct) {
                setEarnedPoints(data.points);
            }
        } catch (error) {
            console.error('Error al validar la respuesta:', error);
        }
    };

    const fetchNextHint = async () => {
        try {
            const response = await fetch(`${backendUrl}/get_next_hint/${token}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.hint) {
                    setHint(data.hint); // Asegurarse de que la pista se está estableciendo
                    setIsHintShown(true); // Establecer correctamente el estado de la pista
                } else {
                    alert('No hay más pistas disponibles.');
                }
            } else {
                alert('No se pudo obtener la pista.');
            }
        } catch (error) {
            console.error('Error al obtener la pista:', error);
        }
    };

    const handleBackToHome = () => {
        navigate('/home');
    };

    if (loading) {
        return <CircularProgress />;
    }

    return (
        <Box sx={{ textAlign: 'center', p: 3 }}>
            <Typography variant="h4">Desafío</Typography>
            {challenge && (
                <>
                    <Typography variant="h6">{challenge.question}</Typography>
                    <RadioGroup
                        value={selectedAnswer}
                        onChange={(e) => setSelectedAnswer(e.target.value)}
                    >
                        {challenge.options.map((option, index) => (
                            <FormControlLabel
                                key={index}
                                value={option}
                                control={<Radio />}
                                label={option}
                                disabled={isAnswered}
                            />
                        ))}
                    </RadioGroup>

                    {/* Botón de Enviar Respuesta */}
                    {!isAnswered && (
                        <Button onClick={handleSolveChallenge} variant="contained" sx={{ mt: 2 }}>
                            Enviar Respuesta
                        </Button>
                    )}

                    {/* Mensaje de Retroalimentación */}
                    {feedbackMessage && (
                        <Typography variant="body1" sx={{ mt: 2 }}>
                            {feedbackMessage}
                        </Typography>
                    )}

                    {/* Mostrar Botón de Pista si Respondido y Sin Pista Aún */}
                    {isAnswered && !isHintShown && (
                        <Button onClick={fetchNextHint} variant="outlined" sx={{ mt: 2 }}>
                            Mostrar Pista
                        </Button>
                    )}

                    {/* Mostrar Pista y Botón de Volver */}
                    {isHintShown && (
                        <>
                            <Typography variant="body1" sx={{ mt: 2 }}>
                                {hint}
                            </Typography>
                            <Button onClick={handleBackToHome} variant="contained" sx={{ mt: 2 }}>
                                Volver al Inicio
                            </Button>
                        </>
                    )}
                </>
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

export default Challenge;
