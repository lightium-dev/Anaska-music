import { CreationOptional, DataTypes, Model, Sequelize } from 'sequelize';

export class ChatSession extends Model {
  declare id: CreationOptional<string>;
  declare user_id: string;
  declare started_at: CreationOptional<Date>;
}

export function initializeChatSessionModel(sequelize: Sequelize): typeof ChatSession {
  ChatSession.init(
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      user_id: { type: DataTypes.UUID, allowNull: false },
      started_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    },
    {
      sequelize,
      tableName: 'chat_sessions',
      timestamps: false,
    }
  );

  return ChatSession;
}
