import { Sequelize } from 'sequelize';
import { initializeChatMessageModel, ChatMessage } from '../modules/chat/chat-message.model';
import { initializeChatSessionModel, ChatSession } from '../modules/chat/chat-session.model';
import {
  initializeMusicKnowledgeModel,
  MusicKnowledge,
} from '../modules/chat/music-knowledge.model';
import { initializeGenreModel, Genre } from '../modules/music/genre.model';
import { initializeTrackModel, Track } from '../modules/music/track.model';
import { initializeUserModel, User } from '../modules/auth/user.model';

export interface DatabaseModels {
  User: typeof User;
  Genre: typeof Genre;
  Track: typeof Track;
  ChatSession: typeof ChatSession;
  ChatMessage: typeof ChatMessage;
  MusicKnowledge: typeof MusicKnowledge;
}

export function initializeModels(sequelize: Sequelize): DatabaseModels {
  const models: DatabaseModels = {
    User: initializeUserModel(sequelize),
    Genre: initializeGenreModel(sequelize),
    Track: initializeTrackModel(sequelize),
    ChatSession: initializeChatSessionModel(sequelize),
    ChatMessage: initializeChatMessageModel(sequelize),
    MusicKnowledge: initializeMusicKnowledgeModel(sequelize),
  };

  models.Track.belongsTo(models.Genre, {
    foreignKey: 'genre_id',
    as: 'genre',
    onDelete: 'RESTRICT',
  });
  models.Genre.hasMany(models.Track, { foreignKey: 'genre_id', as: 'tracks' });
  models.ChatSession.hasMany(models.ChatMessage, {
    foreignKey: 'session_id',
    as: 'messages',
    onDelete: 'CASCADE',
  });
  models.ChatMessage.belongsTo(models.ChatSession, {
    foreignKey: 'session_id',
    as: 'session',
    onDelete: 'CASCADE',
  });

  return models;
}
