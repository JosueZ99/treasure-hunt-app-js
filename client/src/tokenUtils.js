import axios from 'axios';

const apiUrl = process.env.REACT_APP_API_URL;

export const refreshAccessToken = async () => {
    if (!apiUrl) {
        console.error('Error: La URL del backend no está configurada.');
        throw new Error('URL del backend no configurada.');
    }

    const refreshToken = localStorage.getItem('refresh_token');

    if (!refreshToken) {
        console.error('No hay refresh token disponible.');
        throw new Error('No hay refresh token disponible.');
    }

    try {
        const response = await axios.post(`${apiUrl}/token/refresh`, { // ✅ Removed trailing slash
            refresh: refreshToken  // ✅ Fixed the key here
        });

        if (response.data.access_token) {
            localStorage.setItem('access_token', response.data.access_token);
            console.log('Access token successfully refreshed.');
            return response.data.access_token;
        } else {
            throw new Error('Error: No se pudo obtener un nuevo token de acceso.');
        }
    } catch (error) {
        console.error('Error al refrescar el token:', error);

        // ✅ Avoid direct URL changes, use React Router instead
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        
        // Redirect using React Router, if available
        if (window.location.pathname !== '/login') {
            window.location.href = '/login'; 
        }

        throw new Error('Token inválido. Debes iniciar sesión nuevamente.');
    }
};
