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
 * Similar a get_leaderboard de Django
 */
exports.getLeaderboard = async (req, res) => {
  try {
    // Obtener entradas del leaderboard ordenadas por total_points desc
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
 * Escanea un código QR y genera un token de acceso QR para desafíos
 */
exports.scanQrCode = async (req, res) => {
  try {
    const { userId } = req.user;      // Extraer usuario del middleware JWT
    const { qr_code } = req.body;     // Extraer qr_code del cuerpo de la solicitud

    // Verificar si se proporcionó qr_code
    if (!qr_code) {
      return res.status(400).json({ error: 'El código QR es obligatorio.' });
    }

    // Encontrar la ubicación vinculada al código QR
    const location = await Location.findOne({ where: { qr_code } });
    if (!location) {
      return res.status(404).json({ error: 'Código QR no válido.' });
    }

    // Verificar si el usuario ya completó esta ubicación
    let userProgress = await UserProgress.findOne({
      where: { user_id: userId, location_id: location.id }
    });

    if (userProgress && userProgress.completed) {
      return res.status(403).json({ error: 'Ya has completado este desafío.' });
    }

    // Generar un token único usando UUID
    const { v4: uuidv4 } = require('uuid');  // Asegurarse de que la importación de UUID esté presente
    const token = uuidv4();
    const expiresAt = moment().add(15, 'minutes').toDate(); 

    // Crear una entrada QRAccessToken
    const qrToken = await QRAccessToken.create({
      user_id: userId,
      location_id: location.id,
      token: token, // Asegurarse de que el token se almacene correctamente
      expires_at: expiresAt
    });

    // Si el progreso del usuario no existe, crear una nueva entrada
    if (!userProgress) {
      await UserProgress.create({
        user_id: userId,
        location_id: location.id,
        current_hint: 1,
        completed: false,
        points_earned: 0
      });
    }

    // Devolver respuesta de éxito con el token generado
    return res.status(200).json({
      message: 'QR escaneado con éxito.',
      location: location.name,
      token: qrToken.token
    });

  } catch (error) {
    console.error('scanQrCode Error:', error.message);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

/**
 * GET /api/get_challenge/:token
 * Obtiene el desafío usando el token QR, no el token JWT.
 */
exports.getChallenge = async (req, res) => {
  try {
      const { token } = req.params; // Ahora usando el token QR de la URL
      const { userId } = req.user;

      // Asegurarse de que se reciba el token y sea correcto
      if (!token) {
          return res.status(400).json({ error: 'Token no proporcionado.' });
      }

      const qrToken = await QRAccessToken.findOne({
          where: { token },
          include: ['location']
      });

      if (!qrToken) {
          return res.status(404).json({ error: 'Token no válido.' });
      }

      if (moment().isAfter(moment(qrToken.expires_at))) {
          return res.status(403).json({ error: 'El token ha expirado.' });
      }

      const challenge = await Challenge.findOne({
          where: { location_id: qrToken.location_id }
      });

      if (!challenge) {
          return res.status(404).json({ error: 'No se encontró un desafío para esta ubicación.' });
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
 * Similar a validate_answer de Django
 */
exports.validateAnswer = async (req, res) => {
  try {
    const { userId } = req.user;
    const { token } = req.params;
    const { answer } = req.body;

    // 1. Encontrar QRAccessToken
    const qrToken = await QRAccessToken.findOne({ where: { token } });
    if (!qrToken) {
      return res.status(404).json({ error: 'Token inválido.' });
    }

    // 2. Verificar si ha expirado
    if (moment().isAfter(moment(qrToken.expires_at))) {
      return res.status(403).json({ error: 'El token ha expirado.' });
    }

    // 3. Verificar si el usuario ya completó
    const userProgress = await UserProgress.findOne({
      where: { user_id: userId, location_id: qrToken.location_id }
    });
    if (userProgress && userProgress.completed) {
      return res
        .status(403)
        .json({ message: 'Este desafío ya ha sido completado.' });
    }

    // 4. Encontrar desafío
    const challenge = await Challenge.findOne({
      where: { location_id: qrToken.location_id }
    });
    if (!challenge) {
      return res
        .status(404)
        .json({ error: 'No se encontró el desafío para esta ubicación.' });
    }

    // 5. Comparar respuestas (sin distinguir mayúsculas)
    if (answer && challenge.correct_answer.toLowerCase() === answer.toLowerCase()) {
      // Marcar progreso como completado
      userProgress.completed = true;
      userProgress.completed_at = new Date();
      userProgress.points_earned += challenge.points;
      await userProgress.save();

      // Devolver éxito
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
 * Similar a update_user_progress de Django
 */
exports.updateUserProgress = async (req, res) => {
  try {
    const { userId } = req.user;
    const { token } = req.params;

    const qrToken = await QRAccessToken.findOne({ where: { token } });
    if (!qrToken) {
      return res.status(404).json({ error: 'Token inválido.' });
    }

    // Verificar expiración
    if (moment().isAfter(moment(qrToken.expires_at))) {
      return res.status(403).json({ error: 'El token ha expirado.' });
    }

    const challenge = await Challenge.findOne({
      where: { location_id: qrToken.location_id }
    });
    if (!challenge) {
      return res.status(404).json({ error: 'No hay desafíos disponibles.' });
    }

    // Encontrar o crear progreso del usuario
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

    // Actualizar el leaderboard
    let leaderboard = await Leaderboard.findOne({ where: { user_id: userId } });
    if (!leaderboard) {
      // Si el usuario de alguna manera no tiene un registro en el leaderboard aún
      leaderboard = await Leaderboard.create({
        user_id: userId,
        total_points: challenge.points
      });
    } else {
      leaderboard.total_points += challenge.points;
      await leaderboard.save();
    }

    // Registrar participación
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

exports.getNextHint = async (req, res) => {
    try {
        const { userId } = req.user;
        const { token } = req.params;

        // Validar presencia del token
        if (!token) {
            return res.status(400).json({ error: 'Token no proporcionado.' });
        }

        // Verificar si el token existe
        const qrToken = await QRAccessToken.findOne({ where: { token } });
        if (!qrToken) {
            return res.status(404).json({ error: 'Token no válido.' });
        }

        // Verificar si el token ha expirado
        if (moment().isAfter(moment(qrToken.expires_at))) {
            return res.status(403).json({ error: 'El token ha expirado.' });
        }

        // Obtener progreso del usuario para esta ubicación
        const userProgress = await UserProgress.findOne({
            where: { user_id: userId, location_id: qrToken.location_id }
        });

        if (!userProgress) {
            return res.status(404).json({ error: 'Progreso del usuario no encontrado.' });
        }

        // Obtener la primera pista disponible para esta ubicación (ignorando `order`)
        const hint = await Hint.findOne({
            where: { location_id: qrToken.location_id }
        });

        // Si no se encuentra ninguna pista, devolver un mensaje
        if (!hint) {
            return res.status(200).json({
                message: 'No hay más pistas disponibles para esta ubicación.'
            });
        }

        // Prevenir múltiples pistas si ya se mostró
        if (userProgress.current_hint > 1) {
            return res.status(200).json({
                message: 'Ya has visto la pista para esta ubicación.',
                hint: hint.text
            });
        }

        // Marcar que la pista ha sido mostrada
        userProgress.current_hint += 1;
        await userProgress.save();

        // Devolver la pista
        return res.status(200).json({ hint: hint.text });
    } catch (error) {
        console.error('getNextHint Error:', error);
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
};
