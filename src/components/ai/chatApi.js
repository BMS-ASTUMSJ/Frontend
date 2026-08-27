import api from "../../utils/api";

// ============================================================
// GET USER CHATS
// ============================================================

export const getChats = async () => {
  const response = await api.get("/chats");

  return response.data;
};

// ============================================================
// CREATE CHAT
// ============================================================

export const createChat = async (title = "New Chat") => {
  const response = await api.post("/chats", {
    title,
  });

  return response.data;
};

// ============================================================
// GET CHAT WITH MESSAGES
// ============================================================

export const getChat = async (chatId) => {
  const response = await api.get(`/chats/${chatId}`);

  return response.data;
};

// ============================================================
// SEND MESSAGE
// ============================================================

export const sendChatMessage = async (chatId, message) => {
  const response = await api.post(`/chats/${chatId}/messages`, {
    message,
  });

  return response.data;
};

// ============================================================
// RENAME CHAT
// ============================================================

export const renameChat = async (chatId, title) => {
  const response = await api.patch(`/chats/${chatId}`, {
    title,
  });

  return response.data;
};

// ============================================================
// DELETE CHAT
// ============================================================

export const deleteChat = async (chatId) => {
  const response = await api.delete(`/chats/${chatId}`);

  return response.data;
};
