import { CreationOptional, DataTypes, Model, Sequelize } from 'sequelize';

export class MusicKnowledge extends Model {
  declare id: CreationOptional<string>;
  declare title: string;
  declare artist: string | null;
  declare genre: string | null;
  declare content: string;
  declare created_at: CreationOptional<Date>;
}

export function initializeMusicKnowledgeModel(sequelize: Sequelize): typeof MusicKnowledge {
  MusicKnowledge.init(
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      title: { type: DataTypes.STRING(255), allowNull: false },
      artist: { type: DataTypes.STRING(255), allowNull: true },
      genre: { type: DataTypes.STRING(100), allowNull: true },
      content: { type: DataTypes.TEXT, allowNull: false },
      created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    },
    {
      sequelize,
      tableName: 'music_knowledge',
      timestamps: false,
    }
  );

  return MusicKnowledge;
}
