import { api } from "./axios";

const AI_CHAT_TIMEOUT_MS =
  Number(import.meta.env.VITE_AI_CHAT_TIMEOUT_MS) || 70000;

export const askAiAssistant = ({ message, context }) =>
  api.post(
    "/ai/chat",
    {
      message,
      context,
    },
    {
      timeout: AI_CHAT_TIMEOUT_MS,
    },
  );
