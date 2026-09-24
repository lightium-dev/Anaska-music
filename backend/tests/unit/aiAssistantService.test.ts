import { AIAssistantService } from '../../src/services/AIAssistantService';
import { pool } from '../../src/db';

jest.mock('../../src/db', () => ({
  pool: {
    query: jest.fn(),
  },
}));

describe('AIAssistantService Unit Tests', () => {
  const aiService = new AIAssistantService();
  const mockPoolQuery = pool.query as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('saveMessage inserts message and returns record', async () => {
    const mockSaved = {
      id: 'msg-1',
      session_id: 'session-123',
      role: 'user',
      content: 'Hello DJ Muse!',
      created_at: new Date(),
    };
    mockPoolQuery.mockResolvedValueOnce({ rows: [mockSaved] });

    const result = await aiService.saveMessage('session-123', 'user', 'Hello DJ Muse!');
    expect(result).toEqual(mockSaved);
    expect(mockPoolQuery).toHaveBeenCalledWith(
      'INSERT INTO chat_messages (session_id, role, content) VALUES ($1, $2, $3) RETURNING id, session_id, role, content, created_at',
      ['session-123', 'user', 'Hello DJ Muse!']
    );
  });
});
