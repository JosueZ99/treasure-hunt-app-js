const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Challenge = sequelize.define('Challenge', {
    question: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    correct_answer: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    points: {
      type: DataTypes.INTEGER,
      defaultValue: 10,
    },
    options: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
  }, {
    tableName: 'challenges',
    timestamps: false,
  });

  return Challenge;
};
