const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { CustomUser, Leaderboard } = require('../models');
require('dotenv').config();

/**
 * Generates a new JWT access and refresh token for a user
 */
const generateTokens = (user) => {
    const accessToken = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );

    const refreshToken = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );

    return { accessToken, refreshToken };
};

/**
 * POST /api/register
 * Registers a new user and returns JWT tokens.
 */
exports.registerUser = async (req, res) => {
    try {
        const { first_name, last_name, email, password } = req.body;

        if (!first_name || !last_name || !email || !password) {
            return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
        }

        const existingUser = await CustomUser.findOne({ where: { email: email.toLowerCase() } });
        if (existingUser) {
            return res.status(400).json({ error: 'El correo electrónico ya está en uso.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await CustomUser.create({
            email: email.toLowerCase(),
            password: hashedPassword,
            first_name,
            last_name
        });

        // Create a leaderboard entry
        await Leaderboard.create({ user_id: newUser.id, total_points: 0 });

        // Generate tokens after successful registration
        const { accessToken, refreshToken } = generateTokens(newUser);

        return res.status(201).json({
            message: 'Usuario registrado correctamente.',
            access_token: accessToken,
            refresh_token: refreshToken
        });
    } catch (error) {
        console.error('registerUser Error:', error);
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

/**
 * POST /api/login
 * Authenticates the user and returns JWT tokens.
 */
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await CustomUser.findOne({ where: { email: email.toLowerCase() } });

        if (!user) {
            return res.status(401).json({ error: 'Credenciales incorrectas.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Credenciales incorrectas.' });
        }

        // Generate tokens
        const { accessToken, refreshToken } = generateTokens(user);

        return res.status(200).json({
            access_token: accessToken,
            refresh_token: refreshToken
        });
    } catch (error) {
        console.error('loginUser Error:', error);
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

/**
 * GET /api/user-data (Protected Route)
 * Fetches user data for the authenticated user.
 */
exports.getUserData = async (req, res) => {
    try {
        const { userId } = req.user;

        const user = await CustomUser.findByPk(userId);
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado.' });
        }

        const leaderboard = await Leaderboard.findOne({ where: { user_id: user.id } });
        const points = leaderboard ? leaderboard.total_points : 0;

        return res.json({
            name: `${user.first_name} ${user.last_name}`,
            points
        });
    } catch (error) {
        console.error('getUserData Error:', error);
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
};
