require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models'); 
const apiRoutes = require('./routes/api');

const app = express();

// CORS Configuration - Adjusted for Production Readiness
const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
};
app.use(cors(corsOptions));
app.use(express.json());

// Base API Routes
app.use('/api', apiRoutes);

// Test Endpoint (Optional for Debugging)
app.get('/', (req, res) => {
    res.send('Server is working properly!');
});

// Database Sync (Development Mode Only)
sequelize.sync({ force: false }) // Keep force: false to avoid data loss
    .then(() => {
        console.log('Database successfully connected and synced!');
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
    })
    .catch(err => {
        console.error('Error syncing the database:', err);
    });
