const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Leaderboard = sequelize.define('Leaderboard', {
    total_points: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  }, {
    tableName: 'leaderboards',
    timestamps: false,
  });

  return Leaderboard;
};
