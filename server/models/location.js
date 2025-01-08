const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Location = sequelize.define('Location', {
    name: {
      type: DataTypes.STRING(100),
      unique: true,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    qr_code: {
      type: DataTypes.STRING(100),
      unique: true,
      allowNull: false,
    },
  }, {
    tableName: 'locations',
    timestamps: true,
  });

  return Location;
};
