import { CreationOptional, DataTypes, Model, Sequelize } from 'sequelize';

export class ChatMessage extends Model {
  declare id: CreationOptional<string>;
  declare session_id: string;
  declare role: 'user' | 'assistant' | 'system';
  declare content: string;
  declare created_at: CreationOptional<Date>;
}

export function initializeChatMessageModel(sequelize: Sequelize): typeof ChatMessage {
  ChatMessage.init(
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      session_id: { type: DataTypes.UUID, allowNull: false },
      role: { type: DataTypes.STRING(20), allowNull: false },
      content: { type: DataTypes.TEXT, allowNull: false },
      created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    },
    {
      sequelize,
      tableName: 'chat_messages',
      timestamps: false,
    }
  );

  return ChatMessage;
}
