import React, { useState } from 'react';
import { Box, Typography, Paper, Fab } from '@mui/material';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import { useNavigate } from 'react-router-dom';

// Import Images
import eco1Image from '../assets/images/carousel/eco1.jpg';
import eco2Image from '../assets/images/carousel/eco2.jpg';
import eco3Image from '../assets/images/carousel/eco3.jpg';
import eco4Image from '../assets/images/carousel/eco4.jpg';

const Home = () => {
    const [currentSlide, setCurrentSlide] = useState(0); 
    const navigate = useNavigate();

    // Carousel Settings
    const carouselSettings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        beforeChange: (oldIndex, newIndex) => setCurrentSlide(newIndex),
    };

    // Eco-Friendly Tips (Corresponding to Images)
    const ecoTips = [
        "Evita la deforestación. Cada árbol en Ecuador puede capturar hasta 22 kg de CO₂ al año.",
        "Usa transporte público o bicicleta. En Quito, si más personas usaran la bicicleta, se podría reducir hasta un 15% de las emisiones de CO₂.",
        "Apoya la agroecología ecuatoriana. Los cultivos sostenibles generan menos emisiones y cuidan la biodiversidad.",
        "El Parque Nacional Yasuní es uno de los más biodiversos del mundo. Evita plásticos para proteger su vida silvestre."
    ];

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                bgcolor: 'background.default',
                color: 'text.primary',
                position: 'relative',
            }}
        >
            {/* Main Section */}
            <Box sx={{ flex: '1 0 auto', p: 3, textAlign: 'center' }}>
                {/* Title */}
                <Typography variant="h4" sx={{ mb: 2 }}>
                    EcoTreasure Hunt
                </Typography>

                {/* Instructions */}
                <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                        ¡Bienvenido a Eco-Treasure Hunt! Escanea los códigos QR escondidos
                        por el campus, resuelve los desafíos y acumula puntos.
                    </Typography>
                    <Typography variant="body1">
                        Ayuda al planeta siguiendo nuestros consejos para reducir tu huella de carbono.
                    </Typography>
                </Paper>

                {/* Image Carousel */}
                <Box sx={{ mb: 3, width: '100%', maxWidth: '800px', mx: 'auto' }}>
                    <Slider {...carouselSettings}>
                        {[eco1Image, eco2Image, eco3Image, eco4Image].map((img, index) => (
                            <Box
                                key={index}
                                component="img"
                                src={img}
                                alt={`Eco Tip ${index + 1}`}
                                sx={{
                                    width: '100%',
                                    height: { xs: '200px', sm: '300px', md: '400px' },
                                    objectFit: 'cover'
                                }}
                            />
                        ))}
                    </Slider>
                </Box>

                {/* Eco Tip Text */}
                <Typography
                    variant="body1"
                    sx={{
                        mt: 3,
                        fontWeight: 'bold',
                        bgcolor: 'background.default',
                        color: 'primary.main',
                        textAlign: 'center',
                    }}
                >
                    {ecoTips[currentSlide]}
                </Typography>
            </Box>

            {/* Floating Action Buttons */}
            <Fab
                color="secondary"
                aria-label="View Leaderboard"
                onClick={() => navigate('/leaderboard')}
                sx={{
                    position: 'fixed',
                    bottom: { xs: 60, md: 90 },
                    left: 16
                }}
            >
                <LeaderboardIcon />
            </Fab>

            <Fab
                color="primary"
                aria-label="Scan QR Code"
                onClick={() => navigate('/scan-qr')}
                sx={{
                    position: 'fixed',
                    bottom: { xs: 60, md: 90 },
                    right: 16
                }}
            >
                <QrCodeScannerIcon />
            </Fab>
        </Box>
    );
};

export default Home;
