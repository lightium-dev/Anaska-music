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
        throw new Error(`Chat stream failed with status ${response.status}`);
      }

      // Read response stream
      if (response.body && (response.body as any).getReader) {
        const reader = (response.body as any).getReader();
        const decoder = new TextDecoder();
        let full = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const text = decoder.decode(value);
          const lines = text.split('\n\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.replace('data: ', '').trim());
                if (data.chunk) {
                  full += data.chunk;
                  onChunk(data.chunk);
                }
                if (data.done) {
                  onComplete(data.fullResponse || full);
                }
              } catch {
                // Ignore parse errors on partial chunks
              }
            }
          }
        }
      } else {
        // Fallback for environments where body.getReader is not available
        const text = await response.text();
        const lines = text.split('\n\n');
        let full = '';
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.replace('data: ', '').trim());
              if (data.chunk) {
                full += data.chunk;
                onChunk(data.chunk);
              }
            } catch {}
          }
        }
        onComplete(full);
      }
    } catch (err: any) {
      onError(err);
    }
  },
};
