import type { Message } from '../types';

export const postChatStream = async (
  message: string,
  history: Message[],
) => {
  const resp = await fetch(`${import.meta.env.VITE_API_BASE_URL}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      history,
      stream: true,
    }),
  });
  if (!resp.ok) {
    throw new Error(`Chat request failed: ${resp.status}`);
  }
  if (!resp.body) {
    throw new Error('Streaming is not supported by the server');
  }
  return resp.body.getReader();
};

export const postChatOnce = async (
  message: string,
  history: Message[],
) => {
  const resp = await fetch(`${import.meta.env.VITE_API_BASE_URL}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      history,
      stream: false,
    }),
  });
  if (!resp.ok) {
    throw new Error(`Chat request failed: ${resp.status}`);
  }
  return resp.json();
};
