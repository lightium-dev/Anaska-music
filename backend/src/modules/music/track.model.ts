import { CreationOptional, DataTypes, Model, Sequelize } from 'sequelize';

export class Track extends Model {
  declare id: string;
  declare title: string;
  declare artist: string;
  declare genre_id: string;
  declare audio_url: string;
  declare cover_url: string;
  declare duration: number;
  declare created_at: CreationOptional<Date>;
}

export function initializeTrackModel(sequelize: Sequelize): typeof Track {
  Track.init(
    {
      id: { type: DataTypes.STRING(50), primaryKey: true },
      title: { type: DataTypes.STRING(255), allowNull: false },
      artist: { type: DataTypes.STRING(255), allowNull: false },
      genre_id: { type: DataTypes.STRING(50), allowNull: false },
      audio_url: { type: DataTypes.TEXT, allowNull: false },
      cover_url: { type: DataTypes.TEXT, allowNull: false },
      duration: { type: DataTypes.INTEGER, allowNull: false },
      created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    },
    {
      sequelize,
      tableName: 'tracks',
      timestamps: false,
    }
  );

  return Track;
}
