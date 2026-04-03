import { api } from "./axios";

export const askAiAssistant = ({ message, context }) =>
  api.post("/ai/chat", {
    message,
    context,
  });
