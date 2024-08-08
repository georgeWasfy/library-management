import { DataTypes } from 'sequelize';
import { Migration } from '../../umzug';

export const up: Migration = async ({ context: sequelize }) => {
  await sequelize
    .getQueryInterface()
    .addColumn('users', 'password', DataTypes.STRING);

  await sequelize
    .getQueryInterface()
    .addColumn('users', 'hashedRt', DataTypes.STRING);
};

export const down: Migration = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().removeColumn('users', 'password');
  await sequelize.getQueryInterface().removeColumn('users', 'hashedRt');
};
