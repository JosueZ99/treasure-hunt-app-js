const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const QRAccessToken = sequelize.define('QRAccessToken', {
    token: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      unique: true,
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  }, {
    tableName: 'qr_access_tokens',
    timestamps: true,
  });

  return QRAccessToken;
};
