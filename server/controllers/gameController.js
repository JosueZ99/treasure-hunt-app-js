// controllers/gameController.js
const moment = require('moment');
const { Op } = require('sequelize');
const {
  CustomUser,
  Leaderboard,
  Location,
  Challenge,
  Hint,
  UserProgress,
  ParticipationHistory,
  QRAccessToken
} = require('../models');

/**
 * GET /api/leaderboard
 * Similar to Django's get_leaderboard
 */
exports.getLeaderboard = async (req, res) => {
  try {
    // Get leaderboard entries sorted by total_points desc
    const leaderboardEntries = await Leaderboard.findAll({
      order: [['total_points', 'DESC']],
      include: [
        {
          model: CustomUser,
          as: 'user',
          attributes: ['first_name', 'last_name', 'email']
        }
      ]
    });

    const ranking = leaderboardEntries.map((entry, index) => {
      return {
        rank: index + 1,
        name: `${entry.user.first_name} ${entry.user.last_name}`,
        email: entry.user.email,
        points: entry.total_points
      };
    });

    return res.status(200).json(ranking);
  } catch (error) {
    console.error('getLeaderboard Error:', error);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

/**
 * POST /api/scan-qr
 * Scans a QR code and generates a QR access token for challenges
 */
exports.scanQrCode = async (req, res) => {
  try {
    const { userId } = req.user;      // Extract user from JWT middleware
    const { qr_code } = req.body;     // Extract qr_code from request body

    // ✅ Check if qr_code was provided
    if (!qr_code) {
      return res.status(400).json({ error: 'El código QR es obligatorio.' });
    }

    // ✅ Find the location linked to the QR code
    const location = await Location.findOne({ where: { qr_code } });
    if (!location) {
      return res.status(404).json({ error: 'Código QR no válido.' });
    }

    // ✅ Check if user already completed this location
    let userProgress = await UserProgress.findOne({
      where: { user_id: userId, location_id: location.id }
    });

    if (userProgress && userProgress.completed) {
      return res.status(403).json({ error: 'Ya has completado este desafío.' });
    }

    // ✅ Generate a unique token using UUID
    const { v4: uuidv4 } = require('uuid');  // Ensure UUID import is present
    const token = uuidv4();
    const expiresAt = moment().add(15, 'minutes').toDate(); 

    // ✅ Create a QRAccessToken entry
    const qrToken = await QRAccessToken.create({
      user_id: userId,
      location_id: location.id,
      token: token, // Ensure token is stored correctly
      expires_at: expiresAt
    });

    // ✅ If user progress doesn't exist, create a new entry
    if (!userProgress) {
      await UserProgress.create({
        user_id: userId,
        location_id: location.id,
        current_hint: 1,
        completed: false,
        points_earned: 0
      });
    }

    // ✅ Return success response with the generated token
    return res.status(200).json({
      message: 'QR escaneado con éxito.',
      location: location.name,
      token: qrToken.token
    });

  } catch (error) {
    console.error('❌ scanQrCode Error:', error.message);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

/**
 * GET /api/get_challenge/:token
 * Similar to Django's get_challenge
 */
exports.getChallenge = async (req, res) => {
  try {
    const { userId } = req.user;
    const { token } = req.params;

    // 1. Find the QRAccessToken
    const qrToken = await QRAccessToken.findOne({
      where: { token },
      include: ['user', 'location']
    });
    if (!qrToken) {
      return res.status(404).json({ error: 'Token inválido.' });
    }

    // 2. Check if expired
    if (moment().isAfter(moment(qrToken.expires_at))) {
      return res.status(403).json({ error: 'El token ha expirado.' });
    }

    // 3. Check user progress
    const userProgress = await UserProgress.findOne({
      where: {
        user_id: userId,
        location_id: qrToken.location_id
      }
    });
    if (userProgress && userProgress.completed) {
      return res
        .status(403)
        .json({ message: 'Este desafío ya ha sido completado.' });
    }

    // 4. Fetch the challenge for this location
    const challenge = await Challenge.findOne({
      where: { location_id: qrToken.location_id }
    });

    if (!challenge) {
      return res
        .status(404)
        .json({ message: 'No hay desafíos disponibles para esta ubicación.' });
    }

    return res.status(200).json({
      question: challenge.question,
      points: challenge.points,
      options: challenge.options
    });
  } catch (error) {
    console.error('getChallenge Error:', error);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

/**
 * POST /api/validate_answer/:token
 * Similar to Django's validate_answer
 */
exports.validateAnswer = async (req, res) => {
  try {
    const { userId } = req.user;
    const { token } = req.params;
    const { answer } = req.body;

    // 1. Find QRAccessToken
    const qrToken = await QRAccessToken.findOne({ where: { token } });
    if (!qrToken) {
      return res.status(404).json({ error: 'Token inválido.' });
    }

    // 2. Check if expired
    if (moment().isAfter(moment(qrToken.expires_at))) {
      return res.status(403).json({ error: 'El token ha expirado.' });
    }

    // 3. Check if user already completed
    const userProgress = await UserProgress.findOne({
      where: { user_id: userId, location_id: qrToken.location_id }
    });
    if (userProgress && userProgress.completed) {
      return res
        .status(403)
        .json({ message: 'Este desafío ya ha sido completado.' });
    }

    // 4. Find challenge
    const challenge = await Challenge.findOne({
      where: { location_id: qrToken.location_id }
    });
    if (!challenge) {
      return res
        .status(404)
        .json({ error: 'No se encontró el desafío para esta ubicación.' });
    }

    // 5. Compare answers (case-insensitive)
    if (answer && challenge.correct_answer.toLowerCase() === answer.toLowerCase()) {
      // Mark progress completed
      userProgress.completed = true;
      userProgress.completed_at = new Date();
      userProgress.points_earned += challenge.points;
      await userProgress.save();

      // Return success
      return res.status(200).json({
        message: 'Respuesta correcta.',
        points: challenge.points,
        correct: true
      });
    } else {
      return res.status(200).json({
        message: 'Respuesta incorrecta.',
        correct: false
      });
    }
  } catch (error) {
    console.error('validateAnswer Error:', error);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

/**
 * POST /api/update_user_progress/:token
 * Similar to Django's update_user_progress
 */
exports.updateUserProgress = async (req, res) => {
  try {
    const { userId } = req.user;
    const { token } = req.params;

    const qrToken = await QRAccessToken.findOne({ where: { token } });
    if (!qrToken) {
      return res.status(404).json({ error: 'Token inválido.' });
    }

    // Check expiration
    if (moment().isAfter(moment(qrToken.expires_at))) {
      return res.status(403).json({ error: 'El token ha expirado.' });
    }

    const challenge = await Challenge.findOne({
      where: { location_id: qrToken.location_id }
    });
    if (!challenge) {
      return res.status(404).json({ error: 'No hay desafíos disponibles.' });
    }

    // Find or create user progress
    let userProgress = await UserProgress.findOne({
      where: { user_id: userId, location_id: qrToken.location_id }
    });
    if (!userProgress) {
      userProgress = await UserProgress.create({
        user_id: userId,
        location_id: qrToken.location_id,
        points_earned: challenge.points,
        completed: true,
        completed_at: new Date()
      });
    } else {
      userProgress.points_earned += challenge.points;
      userProgress.completed = true;
      userProgress.completed_at = new Date();
      await userProgress.save();
    }

    // Update the leaderboard
    let leaderboard = await Leaderboard.findOne({ where: { user_id: userId } });
    if (!leaderboard) {
      // If user somehow doesn't have a leaderboard record yet
      leaderboard = await Leaderboard.create({
        user_id: userId,
        total_points: challenge.points
      });
    } else {
      leaderboard.total_points += challenge.points;
      await leaderboard.save();
    }

    // Log participation
    await ParticipationHistory.create({
      user_id: userId,
      location_id: qrToken.location_id,
      action: 'Completó el desafío'
    });

    return res.status(200).json({ message: 'Progreso del usuario actualizado con éxito.' });
  } catch (error) {
    console.error('updateUserProgress Error:', error);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

/**
 * GET /api/get_next_hint/:token
 * Similar to Django's get_next_hint
 */
exports.getNextHint = async (req, res) => {
  try {
    const { userId } = req.user;
    const { token } = req.params;

    // 1. Check token
    const qrToken = await QRAccessToken.findOne({ where: { token } });
    if (!qrToken) {
      return res.status(404).json({ error: 'Token inválido.' });
    }

    if (moment().isAfter(moment(qrToken.expires_at))) {
      return res.status(403).json({ error: 'El token ha expirado.' });
    }

    // 2. Find userProgress
    const userProgress = await UserProgress.findOne({
      where: { user_id: userId, location_id: qrToken.location_id }
    });
    if (!userProgress) {
      return res.status(404).json({ error: 'No se encontró progreso.' });
    }

    // 3. Grab the next hint (based on current_hint)
    const nextHint = await Hint.findOne({
      where: {
        location_id: qrToken.location_id,
        order: userProgress.current_hint
      }
    });

    if (!nextHint) {
      // No more hints
      return res.status(200).json({
        message: 'No hay más pistas disponibles para esta ubicación.'
      });
    }

    // Increment current_hint
    userProgress.current_hint += 1;
    await userProgress.save();

    return res.status(200).json({ hint: nextHint.text });
  } catch (error) {
    console.error('getNextHint Error:', error);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
};
