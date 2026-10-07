import { AIAssistantService } from '../../src/modules/chat/chat.service';
import { getModels } from '../../src/db';

jest.mock('../../src/db', () => ({
  getModels: jest.fn(),
}));

describe('AIAssistantService Unit Tests', () => {
  const aiService = new AIAssistantService();
  const mockGetModels = getModels as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('saveMessage creates a message and returns its record', async () => {
    const mockSaved = {
      id: 'msg-1',
      session_id: 'session-123',
      role: 'user',
      content: 'Hello DJ Muse!',
      created_at: new Date(),
    };
    const create = jest.fn().mockResolvedValue({ get: () => mockSaved });
    mockGetModels.mockResolvedValueOnce({ ChatMessage: { create } });

    const result = await aiService.saveMessage('session-123', 'user', 'Hello DJ Muse!');
    expect(result).toEqual(mockSaved);
    expect(create).toHaveBeenCalledWith({
      session_id: 'session-123',
      role: 'user',
      content: 'Hello DJ Muse!',
    });
  });
});
