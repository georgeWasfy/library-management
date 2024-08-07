import { DataTypes } from 'sequelize';
import { Migration } from '../../umzug';

export const up: Migration = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().removeColumn('borrowings', 'is_overdue');
};
export const down: Migration = async ({ context: sequelize }) => {
  await sequelize
    .getQueryInterface()
    .addColumn('borrowings', 'is_overdue', DataTypes.BOOLEAN);
};
