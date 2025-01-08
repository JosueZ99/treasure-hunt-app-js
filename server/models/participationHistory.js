const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ParticipationHistory = sequelize.define('ParticipationHistory', {
    action: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
  }, {
    tableName: 'participation_history',
    timestamps: true,
  });

  return ParticipationHistory;
};
