const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const UserProgress = sequelize.define('UserProgress', {
    current_hint: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    completed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    points_earned: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    completed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    tableName: 'user_progress',
    timestamps: true, // so we have createdAt for "first started"
  });

  return UserProgress;
};
