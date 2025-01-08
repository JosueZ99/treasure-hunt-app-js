require('dotenv').config(); // Load environment variables
const { Sequelize } = require('sequelize');

// Create a new Sequelize instance (PostgreSQL)
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      dialect: 'postgres'
  }
);

module.exports = { sequelize };

// Import models
const CustomUser = require('./customUser')(sequelize);
const Location = require('./location')(sequelize);
const Challenge = require('./challenge')(sequelize);
const Hint = require('./hint')(sequelize);
const UserProgress = require('./userProgress')(sequelize);
const Leaderboard = require('./leaderboard')(sequelize);
const ParticipationHistory = require('./participationHistory')(sequelize);
const QRAccessToken = require('./qrAccessToken')(sequelize);

// 1) Define relationships
// Example: CustomUser -> Leaderboard (One-to-One)
CustomUser.hasOne(Leaderboard, {
  foreignKey: 'user_id',
  as: 'leaderboard',
});
Leaderboard.belongsTo(CustomUser, {
  foreignKey: 'user_id',
  as: 'user',
});

// Example: Location -> Challenge (One-to-Many)
Location.hasMany(Challenge, {
  foreignKey: 'location_id',
  as: 'challenges',
});
Challenge.belongsTo(Location, {
  foreignKey: 'location_id',
  as: 'location',
});

// Example: Location -> Hint (One-to-Many)
Location.hasMany(Hint, {
  foreignKey: 'location_id',
  as: 'hints',
});
Hint.belongsTo(Location, {
  foreignKey: 'location_id',
  as: 'location',
});

// Example: CustomUser -> UserProgress (One-to-Many)
CustomUser.hasMany(UserProgress, {
  foreignKey: 'user_id',
  as: 'progresses',
});
UserProgress.belongsTo(CustomUser, {
  foreignKey: 'user_id',
  as: 'user',
});

// Example: Location -> UserProgress (One-to-Many)
Location.hasMany(UserProgress, {
  foreignKey: 'location_id',
  as: 'progresses',
});
UserProgress.belongsTo(Location, {
  foreignKey: 'location_id',
  as: 'location',
});

// Example: CustomUser -> ParticipationHistory (One-to-Many)
CustomUser.hasMany(ParticipationHistory, {
  foreignKey: 'user_id',
  as: 'participationHistory',
});
ParticipationHistory.belongsTo(CustomUser, {
  foreignKey: 'user_id',
  as: 'user',
});

// Example: Location -> ParticipationHistory (One-to-Many)
Location.hasMany(ParticipationHistory, {
  foreignKey: 'location_id',
  as: 'participationRecords',
});
ParticipationHistory.belongsTo(Location, {
  foreignKey: 'location_id',
  as: 'location',
});

// Example: CustomUser -> QRAccessToken (One-to-Many)
CustomUser.hasMany(QRAccessToken, {
  foreignKey: 'user_id',
  as: 'qrTokens',
});
QRAccessToken.belongsTo(CustomUser, {
  foreignKey: 'user_id',
  as: 'user',
});

// Example: Location -> QRAccessToken (One-to-Many)
Location.hasMany(QRAccessToken, {
  foreignKey: 'location_id',
  as: 'qrTokens',
});
QRAccessToken.belongsTo(Location, {
  foreignKey: 'location_id',
  as: 'location',
});

// 2) Export everything
module.exports = {
  sequelize,
  CustomUser,
  Location,
  Challenge,
  Hint,
  UserProgress,
  Leaderboard,
  ParticipationHistory,
  QRAccessToken,
};
