const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Hint = sequelize.define('Hint', {
    text: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }, {
    tableName: 'hints',
    timestamps: false,
  });

  return Hint;
};
