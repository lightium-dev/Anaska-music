import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApiBaseUrl, apiRequest } from './api';
import { ChatMessage } from '../types';

export const chatService = {
  async getHistory(): Promise<{ sessionId: string; messages: ChatMessage[] }> {
    const res = await apiRequest<{
      success: boolean;
      data: { sessionId: string; messages: any[] };
    }>('/api/chat/history');

    return {
      sessionId: res.data.sessionId,
      messages: res.data.messages.map((m) => ({
        id: m.id,
        sessionId: m.session_id || m.sessionId,
        role: m.role,
        content: m.content,
        createdAt: m.created_at || m.createdAt,
      })),
    };
  },

  async streamChat(
    message: string,
    sessionId: string | undefined,
    onChunk: (chunk: string) => void,
    onComplete: (fullText: string) => void,
    onError: (err: Error) => void
  ): Promise<void> {
    const token = await AsyncStorage.getItem('@anaska_access_token');
    const url = `${getApiBaseUrl()}/api/chat/stream`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message, sessionId }),
      });

      if (!response.ok) {
        const errorJson = await response.json().catch(() => null);
        throw new Error(errorJson?.error?.message || `Chat stream failed with status ${response.status}`);
      }

      // Universal React Native response reader with simulated stream effect
      const text = await response.text();
      const lines = text.split('\n\n');
      let full = '';

      for (const rawLine of lines) {
        const line = rawLine.trim();
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.replace('data: ', '').trim());
            if (data.chunk) {
              full += data.chunk;
              onChunk(data.chunk);
              // Yield briefly to display a smooth, natural typing effect on mobile
              await new Promise((resolve) => setTimeout(resolve, 20));
            }
            if (data.done) {
              full = data.fullResponse || full;
            }
          } catch {
            // Ignore partial/comment frames (e.g. : ping)
          }
        }
      }

      onComplete(full);
    } catch (err: any) {
      console.error('Chat stream error:', err);
      onError(err);
    }
  },
};
