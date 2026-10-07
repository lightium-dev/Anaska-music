import { DataTypes, Model, Sequelize } from 'sequelize';

export class Genre extends Model {
  declare id: string;
  declare name: string;
}

export function initializeGenreModel(sequelize: Sequelize): typeof Genre {
  Genre.init(
    {
      id: { type: DataTypes.STRING(50), primaryKey: true },
      name: { type: DataTypes.STRING(100), allowNull: false, unique: true },
    },
    {
      sequelize,
      tableName: 'genres',
      timestamps: false,
    }
  );

  return Genre;
}
